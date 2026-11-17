import { FloatingSheet } from '../../../design-system/components/FloatingSheet/FloatingSheet';
import {
  PencilIcon,
  TrashIcon,
} from '../../../design-system/components/Icon/Icons';
import {
  OptionList,
  OptionRow,
} from '../../../design-system/components/OptionList/OptionList';
import { colors } from '../../../design-system/tokens/colors';

/** Menu behind the ⋯ button of the habit details. Choosing an option swaps
 * straight to the next card, so there is no exit animation to wait for. */
export function HabitOptionsModal({
  name,
  onEdit,
  onDelete,
  onClose,
}: {
  name: string;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  return (
    <FloatingSheet title={name} onClose={onClose}>
      <OptionList>
        <OptionRow
          label="Editar hábito"
          icon={<PencilIcon size={20} />}
          onPress={onEdit}
        />
        <OptionRow
          label="Excluir hábito"
          tone="danger"
          icon={<TrashIcon size={20} color={colors.danger} />}
          onPress={onDelete}
        />
      </OptionList>
    </FloatingSheet>
  );
}
