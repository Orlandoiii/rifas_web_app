import Modal from '../core/Modal';
import { useIsLoading, useMessage } from './loadModalStore';
import { Loader } from '../../loader/Loader';

export default function LoadModal() {
    const isLoading = useIsLoading();
    const message = useMessage();

    return (
        <Modal
            open={isLoading}
            size="sm"
            showX={false}
            showBackdrop={false}
        >
            <Loader size="lg" message={message} />
        </Modal>
    );
}