import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import LineChart from './LineChart.jsx';
import React from "react";

import { useLocation } from "react-router-dom";

export default function CardC ({stud, num, studentName, metricLabel = "Joy"}) {

    const [day, setDay] = React.useState(num || 14);

    function changeDays(x){
        setDay(x);
    }

    const dataSource = stud

    // Update day when num prop changes
    React.useEffect(() => {
        if (num !== undefined) {
            setDay(num);
        }
    }, [num]);

    // Determine title based on metric type
    const getTitle = () => {
      if (!studentName) {
        return metricLabel === "Joy" ? "Student Joy" : `Student ${metricLabel}`;
      }
      // For joy factor, add "'s Joy" suffix
      if (metricLabel === "Joy") {
        return `${studentName}'s Joy`;
      }
      // For other metrics (like Bus Factor), use the name as-is
      return studentName;
    };

    return (
        <Card sx={{ maxWidth: 700, margin: 2, boxShadow: 3}}>
            <CardHeader title={studentName || `Student ${metricLabel}`} sx={{ textAlign: "center" }} />
            <CardContent>
                <LineChart num={day} stud={dataSource} metricLabel={metricLabel}/>
            </CardContent>
            <CardActions sx={{ textAlign: "center" }} >
                <Button onClick={() => changeDays(14)} variant="outlined">Last 14 days</Button>
                <Button onClick={() => changeDays(30)} variant="outlined">Last 30 days</Button>
                <Button onClick={() => changeDays(90)} variant="outlined">Last 90 days</Button>
            </CardActions>
        </Card>
    );
}