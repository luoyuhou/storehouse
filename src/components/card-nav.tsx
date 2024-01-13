import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { TransitionProps } from "@mui/material/transitions";
import { DialogContentTextOwnProps } from "@mui/material/DialogContentText/DialogContentText";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: JSX.Element;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export function CardNav({
  dashboardUrl,
  url,
  title,
  disabled,
  imgUrl,
  description,
  dialogTitle,
  ...props
}: {
  dashboardUrl?: string;
  url: string;
  title: string;
  imgUrl: string;
  description: string;
  dialogTitle: string;
} & { disabled?: boolean } & DialogContentTextOwnProps) {
  const [open, setOpen] = useState(false);
  const dialogId = "alert-dialog-slide-description";

  return (
    <Card style={{ maxWidth: 345 }}>
      <CardActionArea>
        <CardMedia
          component="img"
          alt="Contemplative Reptile"
          height="240"
          image={imgUrl}
          title={title}
          onClick={() => {
            if (!dashboardUrl) {
              return;
            }
            window.open(dashboardUrl, "_blank");
          }}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            {title}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button
          disabled={disabled}
          size="small"
          color="primary"
          onClick={() => window.open(url, "_blank")}
        >
          申请
        </Button>
        <Button disabled={disabled} size="small" color="primary" onClick={() => setOpen(true)}>
          查看更多
        </Button>
      </CardActions>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => setOpen(false)}
        aria-describedby={dialogId}
      >
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText id={dialogId} {...props} />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
