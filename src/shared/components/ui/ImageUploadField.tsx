import { useEffect, useRef, useState, type DragEvent } from 'react';
import { Button } from 'primereact/button';
import UserAvatar from '@/shared/components/ui/UserAvatar';
import { CameraIcon } from '@/shared/components/icons';
import ImageCropperDialog from '@/shared/components/ui/ImageCropperDialog';
import { IMAGE_ACCEPT, imageFileError, imageTypeError } from '@/shared/helpers/imageFile.helper';
import styles from './ImageUploadField.module.css';

interface ImageUploadFieldProps {
    /** E.g. "Foto do vendedor". */
    title: string;
    /** Name and id, for the initials shown while there is no image. */
    name: string;
    id?: number;
    /** Square suits companies; people stay round. */
    shape?: 'circle' | 'square';
    /** Image already saved; shown until another one is picked. */
    currentUrl?: string | null;
    /** Image picked in this form, sent when the form is saved. */
    file: File | null;
    onFileChange: (file: File | null) => void;
}

/**
 * Picks an image (click or drag and drop), lets the user crop it to a square and shows its preview.
 * The cropped file is checked against the API's limits before it reaches the form.
 */
export default function ImageUploadField({
    title,
    name,
    id,
    shape = 'circle',
    currentUrl,
    file,
    onFileChange,
}: ImageUploadFieldProps) {
    const fileInput = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [dragging, setDragging] = useState(false);
    /** Image being cropped, before it becomes the picked file. */
    const [cropping, setCropping] = useState<{ src: string; name: string } | null>(null);

    useEffect(() => {
        if (!file) {
            setPreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    useEffect(() => {
        if (!cropping) return;
        return () => URL.revokeObjectURL(cropping.src);
    }, [cropping]);

    const image = preview ?? (currentUrl || null);

    const pickFile = (picked?: File | null) => {
        if (!picked) return;
        const typeError = imageTypeError(picked);
        setError(typeError);
        if (!typeError) setCropping({ src: URL.createObjectURL(picked), name: picked.name });
    };

    const closeCropper = () => setCropping(null);

    const applyCrop = (cropped: File) => {
        const croppedError = imageFileError(cropped);
        setError(croppedError);
        if (!croppedError) onFileChange(cropped);
        closeCropper();
    };

    const chooseImage = () => fileInput.current?.click();

    // The API keeps the saved image when none is sent, so only a newly picked one can be dropped.
    const discardPicked = () => {
        setError(null);
        onFileChange(null);
    };

    const onDragOver = (e: DragEvent) => {
        e.preventDefault();
        setDragging(true);
    };

    const onDrop = (e: DragEvent) => {
        e.preventDefault();
        setDragging(false);
        pickFile(e.dataTransfer.files?.[0]);
    };

    const avatarClass = shape === 'square' ? `${styles.avatarButton} ${styles.square}` : styles.avatarButton;

    return (
        <div
            className={dragging ? `${styles.dropzone} ${styles.dragging}` : styles.dropzone}
            onDragOver={onDragOver}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
        >
            <button type="button" className={avatarClass} onClick={chooseImage} aria-label="Escolher imagem">
                <UserAvatar name={name} id={id} src={image} size={72} shape={shape} />
                <span className={styles.cameraBadge}>
                    <CameraIcon size={13} />
                </span>
            </button>

            <div className={styles.details}>
                <div className={styles.text}>
                    <div className={styles.title}>{title}</div>
                    <div className={styles.description}>
                        JPG, PNG ou WebP até 5 MB. Clique ou arraste a imagem para cá.
                    </div>
                </div>
                <div className={styles.buttons}>
                    <Button
                        type="button"
                        size="small"
                        outlined
                        label={image ? 'Trocar imagem' : 'Enviar imagem'}
                        onClick={chooseImage}
                    />
                    {file && (
                        <Button
                            type="button"
                            size="small"
                            text
                            severity="danger"
                            label={currentUrl ? 'Manter a atual' : 'Remover'}
                            className={styles.remove}
                            onClick={discardPicked}
                        />
                    )}
                </div>
                {error && (
                    <div className={styles.error} role="alert">
                        {error}
                    </div>
                )}
            </div>

            <input
                ref={fileInput}
                type="file"
                accept={IMAGE_ACCEPT}
                hidden
                aria-label="Arquivo de imagem"
                onChange={(e) => {
                    pickFile(e.target.files?.[0]);
                    e.target.value = '';
                }}
            />

            <ImageCropperDialog
                key={cropping?.src}
                src={cropping?.src ?? null}
                fileName={cropping?.name ?? ''}
                shape={shape}
                onCancel={closeCropper}
                onCrop={applyCrop}
            />
        </div>
    );
}
