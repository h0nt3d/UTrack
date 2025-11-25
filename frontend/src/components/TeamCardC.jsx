import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import TeamLineChart from './TeamLineChart.jsx';
import React from "react";

import { useLocation } from "react-router-dom";

export default function TeamCardC ({allStuds, num, team, metricLabel = "Average Joy"}) {

    const [day, setDay] = React.useState(num || 14);

    function changeDays(x){
        setDay(x);
    }

    // Use allStuds prop if provided
    const dataSource = allStuds

    // Update day when num prop changes
    React.useEffect(() => {
        if (num !== undefined) {
            setDay(num);
        }
    }, [num]);

    // Determine title based on metric type
    const getTitle = () => {
      if (!team) {
        return metricLabel === "Average Joy" ? "Team Joy" : `Team ${metricLabel}`;
      }
      // For joy factor, add "'s Joy" suffix
      if (metricLabel === "Average Joy") {
        return `${team}'s Joy`;
      }
      // For other metrics (like Bus Factor), use the name as-is
      return team;
    };

    return (
        <Card sx={{ maxWidth: 700, margin: 2, boxShadow: 3}}>
            <CardHeader title={getTitle()} sx={{ textAlign: "center" }} />
            <CardContent>
                <TeamLineChart num={day} allStuds={dataSource} metricLabel={metricLabel}/>
            </CardContent>
            <CardActions sx={{ textAlign: "center" }} >
                <Button onClick={() => changeDays(14)} variant="outlined">Last 14 days</Button>
                <Button onClick={() => changeDays(30)} variant="outlined">Last 30 days</Button>
                <Button onClick={() => changeDays(90)} variant="outlined">Last 90 days</Button>
            </CardActions>
        </Card>
    );
}