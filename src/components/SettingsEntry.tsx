import { Checkbox, FormControlLabel, Typography, checkboxClasses } from "@mui/material";

export const SettingEntry = ({
  title,
  subtitle,
  onChange,
  checked,
}: {
  title: string;
  subtitle: string;
  onChange: () => void;
  checked: boolean;
}) => {
  return (
    <div className="flex items-center gap-2 w-fit">
      <div className="mr-auto">
        <Typography variant="subtitle1" component="span" className="font-bold">
          {title}
        </Typography>
        <Typography variant="caption" display="block" className="text-xs font-bold text-neutral-400 -mt-1">
          {subtitle}
        </Typography>
      </div>
      <FormControlLabel
        control={
          <Checkbox
            checked={checked}
            onChange={onChange}
            name={title}
            sx={{
              [`&, &.${checkboxClasses.checked}`]: {
                color: "rgb(94,94,94)",
              },
            }}
          />
        }
        label=""
        className="m-0"
      />
    </div>
  );
};
