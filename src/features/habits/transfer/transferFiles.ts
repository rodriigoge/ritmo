import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { TransferError, type TransferFormat } from './habitTransfer';

// Device side of import/export: writing a file and opening the share sheet
// (save to Drive, Files, e-mail…), and picking a file to read back.

const MAX_IMPORT_BYTES = 5 * 1024 * 1024;

const MIME: Record<TransferFormat, { mimeType: string; UTI: string }> = {
  json: { mimeType: 'application/json', UTI: 'public.json' },
  csv: { mimeType: 'text/csv', UTI: 'public.comma-separated-values-text' },
};

export async function shareExport(
  format: TransferFormat,
  content: string,
  day: string,
): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new TransferError('Este aparelho não permite compartilhar arquivos.');
  }
  const file = new File(Paths.cache, `ritmo-habitos-${day}.${format}`);
  if (file.exists) file.delete();
  file.create();
  file.write(content);
  await Sharing.shareAsync(file.uri, {
    ...MIME[format],
    dialogTitle: 'Exportar hábitos',
  });
}

/** Resolves null when the user closes the picker. */
export async function pickImportText(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({
    // CSV has no reliable MIME type on Android, so accept any file and
    // let the parser decide.
    type: '*/*',
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (asset.size !== undefined && asset.size > MAX_IMPORT_BYTES) {
    throw new TransferError('O arquivo é grande demais (máximo de 5 MB).');
  }
  try {
    return await new File(asset.uri).text();
  } catch {
    throw new TransferError('Não foi possível ler o arquivo escolhido.');
  }
}
