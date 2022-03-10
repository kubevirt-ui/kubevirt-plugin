import { useKubevirtTranslation } from "@kubevirt-utils/hooks/useKubevirtTranslation";
import { K8sResourceCommon } from "@openshift-console/dynamic-plugin-sdk-internal/lib/extensions/console-types";
import { ActionGroup, Button, Modal } from "@patternfly/react-core";
import * as React from "react";

type DeleteResourceModalProps = {
    obj: K8sResourceCommon;
    onClose: () => void;
    isOpen: boolean;
    onDelete: () => void;
    isProcessing?: boolean;
};

const DeleteResourceModal: React.FC<DeleteResourceModalProps> = ({ obj, onClose, isOpen, onDelete, isProcessing }) => {
    const { t } = useKubevirtTranslation();
    return <Modal variant="small"
    position="top"
    className="ocs-modal co-catalog-page__overlay"
    onClose={onClose}
    header={<h1>{t("Delete {{kind}}", { kind: obj.kind })}</h1>}
    footer={
        <ActionGroup>
      <Button isLoading={isProcessing} onClick={onDelete} variant="danger">
        {t('Delete')}
      </Button>
      <Button onClick={onClose} variant="link">
        {t('Cancel')}
      </Button>
    </ActionGroup>
    }
    isOpen={isOpen}>
        {t("Are you sure you want to delete {{name}} from {{namespace}}?", { name: obj.metadata.name, namespace: obj.metadata.namespace })}
    </Modal>
};

export default DeleteResourceModal;

