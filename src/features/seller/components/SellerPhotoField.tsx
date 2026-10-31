import { useEffect, useId, useRef, useState, type DragEvent } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import UserAvatar from '@/shared/components/ui/UserAvatar';
import FormField from '@/shared/components/ui/FormField';
import { CameraIcon, LinkIcon } from '@/shared/components/icons';
import { isSellerPhotoUploadEnabled } from '../service/seller.service';
import styles from './SellerPhotoField.module.css';

const MAX_SIZE = 2 * 1024 * 1024;
const ACCEPTED_TYPES = /^image\/(png|jpe?g|webp)$/;

interface SellerPhotoFieldProps {
    /** Seller name and id, for the initials shown while there is no photo. */
    name: string;
    sellerId?: number;
    /** Photo picked in this form, uploaded when the form is saved. */
    file: File | null;
    onFileChange: (file: File | null) => void;
    /** Photo already saved, or typed as a URL. */
    url: string;
    onUrlChange: (url: string) => void;
}

export default function SellerPhotoField({
    name,
    sellerId,
    file,
    onFileChange,
    url,
    onUrlChange,
}: SellerPhotoFieldProps) {
    const fileInput = useRef<HTMLInputElement>(null);
    const urlInputId = useId();
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [dragging, setDragging] = useState(false);
    // TODO: remove the URL input once the API stores uploaded photos and returns a signed URL.
    const [showUrlInput, setShowUrlInput] = useState(false);

    useEffect(() => {
        if (!file) {
            setPreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    const photo = preview ?? (url || null);

    const pickFile = (picked?: File | null) => {
        if (!picked) return;
        if (!ACCEPTED_TYPES.test(picked.type)) return setError('Formato não suportado. Envie JPG ou PNG.');
        if (picked.size > MAX_SIZE) return setError('Arquivo maior que 2 MB.');
        setError(null);
        setShowUrlInput(false);
        onFileChange(picked);
    };

    const choosePhoto = () => {
        if (isSellerPhotoUploadEnabled) {
            fileInput.current?.click();
        } else {
            setShowUrlInput(true);
        }
    };

    const removePhoto = () => {
        setError(null);
        onFileChange(null);
        onUrlChange('');
    };

    const onDragOver = (e: DragEvent) => {
        if (!isSellerPhotoUploadEnabled) return;
        e.preventDefault();
        setDragging(true);
    };

    const onDrop = (e: DragEvent) => {
        e.preventDefault();
        setDragging(false);
        pickFile(e.dataTransfer.files?.[0]);
    };

    return (
        <div className={styles.root}>
            <div
                className={dragging ? `${styles.dropzone} ${styles.dragging}` : styles.dropzone}
                onDragOver={onDragOver}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
            >
                <button type="button" className={styles.avatarButton} onClick={choosePhoto} aria-label="Escolher foto">
                    <UserAvatar name={name} id={sellerId} src={photo} size={72} />
                    <span className={styles.cameraBadge}>
                        <CameraIcon size={13} />
                    </span>
                </button>

                <div className={styles.details}>
                    <div className={styles.text}>
                        <div className={styles.title}>Foto do vendedor</div>
                        <div className={styles.description}>
                            {isSellerPhotoUploadEnabled
                                ? 'JPG ou PNG até 2 MB. Clique ou arraste a imagem para cá.'
                                : 'Informe o endereço (URL) da imagem.'}
                        </div>
                    </div>
                    <div className={styles.buttons}>
                        <Button
                            type="button"
                            size="small"
                            outlined
                            label={photo ? 'Trocar foto' : 'Enviar foto'}
                            onClick={choosePhoto}
                        />
                        {photo && (
                            <Button
                                type="button"
                                size="small"
                                text
                                severity="danger"
                                label="Remover"
                                className={styles.remove}
                                onClick={removePhoto}
                            />
                        )}
                        {isSellerPhotoUploadEnabled && !showUrlInput && (
                            <Button
                                type="button"
                                size="small"
                                text
                                label="Usar URL"
                                className={styles.remove}
                                onClick={() => setShowUrlInput(true)}
                            />
                        )}
                    </div>
                    {error && <div className={styles.error}>{error}</div>}
                </div>

                <input
                    ref={fileInput}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    hidden
                    onChange={(e) => {
                        pickFile(e.target.files?.[0]);
                        e.target.value = '';
                    }}
                />
            </div>

            {showUrlInput && (
                <FormField id={urlInputId} label="URL da imagem" icon={<LinkIcon />}>
                    <InputText
                        id={urlInputId}
                        type="url"
                        value={url}
                        placeholder="https://"
                        autoFocus
                        onChange={(e) => {
                            onFileChange(null);
                            onUrlChange(e.target.value);
                        }}
                    />
                </FormField>
            )}
        </div>
    );
}
