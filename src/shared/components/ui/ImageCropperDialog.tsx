import { useId, useState } from 'react';
import Cropper, { type Area, type Point } from 'react-easy-crop';
import { Button } from 'primereact/button';
import { Slider } from 'primereact/slider';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/shared/components/ui/Modal';
import { cropImage } from '@/shared/helpers/cropImage.helper';
import styles from './ImageCropperDialog.module.css';

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

interface ImageCropperDialogProps {
    /** Object URL of the picked image; null keeps the dialog closed. */
    src: string | null;
    /** Name of the picked file, reused for the cropped one. */
    fileName: string;
    shape?: 'circle' | 'square';
    onCancel: () => void;
    onCrop: (file: File) => void;
}

/** Lets the user frame a square cut of the image (drag and zoom) and hands it back as a 512px WebP file. */
export default function ImageCropperDialog({
    src,
    fileName,
    shape = 'circle',
    onCancel,
    onCrop,
}: ImageCropperDialogProps) {
    const titleId = useId();
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(MIN_ZOOM);
    const [area, setArea] = useState<Area | null>(null);
    const [cropping, setCropping] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const apply = async () => {
        if (!src || !area) return;
        setCropping(true);
        setError(null);
        try {
            onCrop(await cropImage(src, area, fileName));
        } catch (cropError) {
            setError(cropError instanceof Error ? cropError.message : 'Não foi possível recortar a imagem.');
        } finally {
            setCropping(false);
        }
    };

    return (
        <Modal visible={src !== null} onHide={onCancel} labelledBy={titleId} width={480}>
            <ModalHeader
                id={titleId}
                title="Ajustar imagem"
                subtitle="Arraste para posicionar e use o zoom para enquadrar."
                onClose={onCancel}
            />

            <ModalBody>
                <div className={styles.cropArea}>
                    {src && (
                        <Cropper
                            image={src}
                            crop={crop}
                            zoom={zoom}
                            minZoom={MIN_ZOOM}
                            maxZoom={MAX_ZOOM}
                            aspect={1}
                            cropShape={shape === 'circle' ? 'round' : 'rect'}
                            showGrid={false}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={(_, pixels) => setArea(pixels)}
                        />
                    )}
                </div>

                <div className={styles.zoom}>
                    <span id={`${titleId}-zoom`} className={styles.zoomLabel}>
                        Zoom
                    </span>
                    <Slider
                        value={zoom}
                        min={MIN_ZOOM}
                        max={MAX_ZOOM}
                        step={0.01}
                        onChange={(e) => setZoom(e.value as number)}
                        className={styles.slider}
                        pt={{ handle: { 'aria-labelledby': `${titleId}-zoom` } }}
                    />
                </div>

                {error && (
                    <div className={styles.error} role="alert">
                        {error}
                    </div>
                )}
            </ModalBody>

            <ModalFooter>
                <Button type="button" label="Cancelar" outlined onClick={onCancel} />
                <Button type="button" label="Aplicar" loading={cropping} disabled={!area} onClick={apply} />
            </ModalFooter>
        </Modal>
    );
}
