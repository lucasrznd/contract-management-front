import { Dialog } from "primereact/dialog";

export default function ImageDialog(props) {
    return <>
        <Dialog visible={props.visible} onHide={props.onHide} header={props.header} style={{ width: '40vw', maxWidth: "55vw", maxHeight: '55vw' }} modal draggable={false}>
            <div className='flex align-items-center justify-content-center'>
                <img src={props.src} alt="Imagem" className='max-w-full max-h-full bg-contain' />
            </div>
        </Dialog>
    </>
}