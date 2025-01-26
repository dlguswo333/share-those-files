'use client';

import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import DescriptionIcon from '@mui/icons-material/Description';
import { useMemo } from "react";

type Props = {
  file: File;
}

const FileItem = ({file}: Props) => {
  const {name, size} = file;

  const prettySize = useMemo(() => {
    const UNITS = ['B', 'KB', 'MB', 'GB'];
    const SEP = 1024;
    let tmpSize = size;
    let index = 0;
    while (tmpSize >= SEP && index < UNITS.length) {
      tmpSize /= SEP;
      index++;
    }
    return `${tmpSize.toFixed(2).replace(/\.00$/, '')}${UNITS[index]}`;
  }, [size])

  return <ListItem>
    <ListItemAvatar>
      <DescriptionIcon />
    </ListItemAvatar>
    <ListItemText primary={name} secondary={prettySize} />
  </ListItem>
};

export default FileItem;
