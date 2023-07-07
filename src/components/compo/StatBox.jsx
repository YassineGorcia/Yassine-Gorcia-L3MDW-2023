import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "./theme"
import ProgressCircle from "./ProgressCircle";

const StatBox = ({ title, subtitle, icon, progress, increase}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box width="100%" m="0 30px">
      <Box display="flex" justifyContent="space-between">
        <Box variant="h3">
          {icon}</Box><Box
              display="flex"
              alignItems="center"
              justifyContent="flex-end"
              flexGrow={1}>
          <Typography
  variant="h1"
  fontWeight="bold"
  sx={{
    color: colors.greenAccent[500],
    textAlign: "right",
    marginLeft: "auto",
  }}
>
  {title}
</Typography>


        </Box>
      
      </Box>
      <Box display="flex" justifyContent="space-between" mt="2px">
        <Typography variant="h3" sx={{ color: colors.greenAccent[500] }}>
          {subtitle}
        </Typography>
        <Typography
          variant="h3"
          fontStyle="italic"
          fontWeight="bold"
          sx={{ color: colors.greenAccent[600] }}
        >
          {increase}
        </Typography>
      </Box>
    </Box>
  );
};

export default StatBox;
