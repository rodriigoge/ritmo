import { useRef, useState } from 'react';
import { Text } from 'react-native';
import { Button } from '../../../design-system/components/Button/Button';
import {
  FloatingSheet,
  type FloatingSheetHandle,
} from '../../../design-system/components/FloatingSheet/FloatingSheet';
import {
  OptionList,
  OptionRow,
} from '../../../design-system/components/OptionList/OptionList';
import { makeStyles } from '../../../design-system/theme/ThemeProvider';
import { typography } from '../../../design-system/tokens/typography';
import { getToday } from '../../../shared/date/dateUtils';
import { useHabits } from '../hooks/useHabits';
import type { ImportResult } from '../repository/HabitRepository';
import {
  parseTransfer,
  toCsv,
  toJson,
  TransferError,
  type ParsedTransfer,
  type TransferFormat,
} from './habitTransfer';
import { pickImportText, shareExport } from './transferFiles';

export type TransferMessage = { tone: 'error' | 'info'; text: string };

const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

function failureText(error: unknown, fallback: string): string {
  return error instanceof TransferError ? error.message : fallback;
}

export function importSummary(result: ImportResult): string {
  const parts = [];
  if (result.createdHabits)
    parts.push(
      plural(result.createdHabits, 'hábito criado', 'hábitos criados'),
    );
  if (result.mergedHabits)
    parts.push(
      plural(result.mergedHabits, 'hábito combinado', 'hábitos combinados'),
    );
  parts.push(plural(result.addedDays, 'dia adicionado', 'dias adicionados'));
  return `Importação concluída: ${parts.join(', ')}.`;
}

/**
 * Export (JSON or CSV, through the share sheet) and import (file picker,
 * then a confirmation card). Render `sheets` next to the screen that
 * triggers `startExport` / `startImport`.
 */
export function useHabitTransfer() {
  const styles = useStyles();
  const { habits, loading, error, importHabits } = useHabits();
  const [choosingFormat, setChoosingFormat] = useState(false);
  const [pending, setPending] = useState<ParsedTransfer | null>(null);
  const [importing, setImporting] = useState(false);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<TransferMessage>();
  const formatSheet = useRef<FloatingSheetHandle>(null);
  const importSheet = useRef<FloatingSheetHandle>(null);

  function startExport() {
    setMessage(undefined);
    if (loading || error) {
      setMessage({
        tone: 'error',
        text: 'Seus hábitos ainda não carregaram. Tente de novo em instantes.',
      });
      return;
    }
    if (habits.length === 0) {
      setMessage({
        tone: 'info',
        text: 'Você ainda não tem hábitos para exportar.',
      });
      return;
    }
    setChoosingFormat(true);
  }

  async function exportAs(format: TransferFormat) {
    setWorking(true);
    try {
      const content =
        format === 'json' ? toJson(habits, new Date()) : toCsv(habits);
      await shareExport(format, content, getToday());
    } catch (failure) {
      setMessage({
        tone: 'error',
        text: failureText(
          failure,
          'Não foi possível exportar. Tente novamente.',
        ),
      });
    } finally {
      setWorking(false);
    }
  }

  async function startImport() {
    setMessage(undefined);
    setWorking(true);
    try {
      const text = await pickImportText();
      if (text !== null) setPending(parseTransfer(text, getToday()));
    } catch (failure) {
      setMessage({
        tone: 'error',
        text: failureText(failure, 'Não foi possível ler o arquivo.'),
      });
    } finally {
      setWorking(false);
    }
  }

  async function confirmImport() {
    if (!pending || importing) return;
    setImporting(true);
    try {
      const result = await importHabits(pending.habits);
      importSheet.current?.close(() => {
        setPending(null);
        setMessage({ tone: 'info', text: importSummary(result) });
      });
    } catch {
      setMessage({
        tone: 'error',
        text: 'Não foi possível concluir a importação. Tente de novo: dias já importados não se repetem.',
      });
      importSheet.current?.close(() => setPending(null));
    } finally {
      setImporting(false);
    }
  }

  const days = pending
    ? pending.habits.reduce(
        (sum, habit) => sum + habit.completedDates.length,
        0,
      )
    : 0;

  const sheets = (
    <>
      {choosingFormat && (
        <FloatingSheet
          ref={formatSheet}
          title="Exportar hábitos"
          description="Escolha o formato. Depois é só salvar ou enviar o arquivo."
          onClose={() => setChoosingFormat(false)}
        >
          <OptionList>
            <OptionRow
              label="JSON"
              value="Backup completo"
              icon={<Text style={styles.badge}>{'{ }'}</Text>}
              onPress={() =>
                formatSheet.current?.close(() => {
                  setChoosingFormat(false);
                  void exportAs('json');
                })
              }
            />
            <OptionRow
              label="CSV"
              value="Para planilhas"
              icon={<Text style={styles.badge}>CSV</Text>}
              onPress={() =>
                formatSheet.current?.close(() => {
                  setChoosingFormat(false);
                  void exportAs('csv');
                })
              }
            />
          </OptionList>
        </FloatingSheet>
      )}
      {pending && (
        <FloatingSheet
          ref={importSheet}
          title="Importar hábitos?"
          description={`Encontramos ${plural(pending.habits.length, 'hábito', 'hábitos')} e ${plural(days, 'dia concluído', 'dias concluídos')}. Hábitos com o mesmo nome dos seus são combinados; nada é apagado.`}
          busy={importing}
          onClose={() => setPending(null)}
        >
          {pending.skipped > 0 && (
            <Text style={styles.note}>
              {plural(
                pending.skipped,
                'item foi ignorado',
                'itens foram ignorados',
              )}{' '}
              (datas futuras ou inválidas, ou nomes vazios).
            </Text>
          )}
          <Button
            label={importing ? 'Importando…' : 'Importar'}
            loading={importing}
            onPress={() => {
              void confirmImport();
            }}
          />
        </FloatingSheet>
      )}
    </>
  );

  return { startExport, startImport, working, message, sheets };
}

const useStyles = makeStyles((colors) => ({
  badge: {
    ...typography.label,
    fontSize: 11,
    color: colors.ink,
  },
  note: { ...typography.body, color: colors.textSecondary },
}));
