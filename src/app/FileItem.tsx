'use client';

type Props = {
  file: File;
}

const FileItem = ({file}: Props) => {
  const {name, size} = file;

  return <div>
    <div>{name}</div>
    <div>{size}</div>
  </div>
};

export default FileItem;
