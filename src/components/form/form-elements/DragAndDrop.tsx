import React, { useEffect, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import style from './input.module.css';

import { Box, Dialog, DialogActions, DialogTitle } from '@mui/material';
import Button from '../../ui/button/Button';
import Label from '../Label';
import { CrossIcon, UploadIcon } from '../../icons/SvgIcons';

interface prop {
  className?: any
  error?: any
  fileLimit?: any
  label?: any
  onChange?: any
  value: any[]
  setDeleted?: any
  disabled?: any
  acceptedFileTypes?: any
}

export const DragAndDropInput: React.FC<prop> = ({
  className,
  error,
  fileLimit,
  label,
  onChange,
  value,
  setDeleted,
  disabled,
  acceptedFileTypes
}) => {
  const [files, setFiles] = useState<any>([]);

  useEffect(() => {
    setFiles([...value]); // Initialize with existing uploaded files
  }, [value]);

  const isBlobUrl = (url: any) => url?.startsWith("blob:");

  const getFileExtension = (file: any) => {
    if (!file) return '';

    if (isBlobUrl(file.fileUrl)) {
      return file.fileName?.split('.').pop()?.toLowerCase() || '';
    }

    try {
      return new URL(file.fileUrl).pathname.split('.').pop()?.toLowerCase() || '';
    } catch {
      return '';
    }
  };

  const getFileType = (file: any) => {
    const ext = getFileExtension(file);
    if (!ext) return 'unknown';

    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext) ? "image" :
      ['mp4', 'webm', 'ogg', 'avi', 'mov', 'm3u8'].includes(ext) ? "video" :
        ['pdf'].includes(ext) ? "pdf" : "unknown";
  };

  const onDrop = useCallback((acceptedFiles: any, rejectedFiles: any) => {
    if (rejectedFiles.length > 0) {
      alert('Invalid file type. Please upload a valid file.');
      return;
    }
    if (fileLimit < files.length + acceptedFiles.length) {
      alert(`You can upload only ${fileLimit} file(s)`);
      return;
    }
    if (disabled) return;

    const newFiles: any = [
      ...files,
      ...acceptedFiles.map((file: any) => ({
        file,
        fileUrl: URL.createObjectURL(file),
        fileName: file.name
      }))
    ];

    setFiles(newFiles);
    onChange(newFiles);
  }, [files, fileLimit, disabled, onChange]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: acceptedFileTypes?.reduce((acc: any, type: any) => ({ ...acc, [type]: [] }), {}),
    onDrop
  });

  const removeFile = useCallback((event: any, file: any, index: any) => {
    event.stopPropagation();
    if (!file.file) {
      setDeleted && setDeleted((prev: any) => [...prev, file.fileName]);
    }
    const updatedFiles = files.filter((_: any, i: any) => i !== index);
    setFiles(updatedFiles);
    onChange(updatedFiles);
  }, [files, onChange, setDeleted]);

  return (
    <>
      <Label>{label}</Label>
      <div className='bg-white'>
        <div {...getRootProps({ className: 'dropzone' })}>
          <input {...getInputProps()} />
          <div
            className={`${style.dragAndDrop_main_con} ${className}`}
            style={{ borderColor: error ? 'red' : '#d3d3d3' }}
          >
            {files.length === 0 ? (
              <div className='mt-4'>
                <div className='flex flex-col items-center'>
                  <div className={style.dragAndDrop_upload_icon_con}>
                    <UploadIcon />
                  </div>
                  <p className={`${style.browse_text} my-3`}>
                    <span className={style.dragAndDrop_click_upload}> Click to upload </span>
                    or drag and drop
                    <br />
                    Images (JPG, PNG, GIF), Videos (MP4, WEBM), or PDFs
                  </p>
                </div>
              </div>
            ) : (
              <div className='flex flex-wrap gap-3 p-4'>
                {files.map((file: any, index: any) => {
                  const fileUrl = file.fileUrl || file;
                  const fileType = getFileType(file);

                  return (
                    <div className={`${style.drop_image_con} p-2`} key={index} onClick={(e) => e.stopPropagation()}>
                      {!disabled && (
                        <div
                          onClick={e => removeFile(e, file, index)}
                          className={`${style.drop_remove_icon}`}
                        >
                          <CrossIcon />
                        </div>
                      )}
                      {fileType === "image" ? (
                        <img src={fileUrl} alt={file.fileName || "Uploaded Image"} className={style.previewImage} />
                      ) : fileType === "video" ? (
                        <div onClick={(e) => e.stopPropagation()}>
                          <ViewVideo fileUrl={fileUrl} />
                        </div>
                      ) : fileType === "pdf" ? (
                        <div onClick={(e) => e.stopPropagation()}>
                          <ViewPdf fileUrl={fileUrl} />
                        </div>
                      ) : (
                        <p className='text-sm text-gray-500'>Unsupported file type</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

function ViewVideo({ fileUrl }: any) {
  const [dialog, setDialog] = useState(false);

  return (
    <>
      <div onClick={(e) => {
        e.stopPropagation();
        setDialog(true);
      }} className='flex justify-center mt-5'>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="34"
          height="34"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
          <polygon points="10 9 15 12 10 15" />
        </svg>
      </div>

      <Dialog fullWidth={true} maxWidth={"sm"} sx={{ zIndex: 99999 }} open={dialog} onClose={() => setDialog(false)}>
        <DialogTitle>Video</DialogTitle>
        <Box p={2}>
          <video controls className={style.previewVideo}>
            <source src={fileUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </Box>
        <DialogActions>
          <Button onClick={() => setDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function ViewPdf({ fileUrl }: any) {
  const [dialog, setDialog] = useState(false);

  return (
    <>
      <div onClick={(e) => {
        e.stopPropagation();
        setDialog(true);
      }} className='flex justify-center mt-5'>
        📄 View PDF
      </div>

      <Dialog sx={{ zIndex: 99999 }} fullWidth={true} maxWidth={"sm"} open={dialog} onClose={() => setDialog(false)}>
        <DialogTitle>PDF Viewer</DialogTitle>
        <Box p={2}>
          <iframe src={fileUrl} width="100%" height="500px"></iframe>
        </Box>
        <DialogActions>
          <Button onClick={() => setDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
