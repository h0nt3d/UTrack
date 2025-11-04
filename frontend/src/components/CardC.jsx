import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import LineChart from './LineChart.jsx';
import React from "react";

import { useLocation } from "react-router-dom";

export default function CardC ({stud, num, studentName}) {

    const [day, setDay] = React.useState(num || 14);

    function changeDays(x){
        setDay(x);
    }

    const { state } = useLocation();
    // Use stud prop if provided, otherwise try to get from location state
    const dataSource = stud || state?.s;

    // Update day when num prop changes
    React.useEffect(() => {
        if (num !== undefined) {
            setDay(num);
        }
    }, [num]);

    return (
        <Card sx={{ maxWidth: 700, margin: 2, boxShadow: 3}}>
            <CardHeader title={studentName ? `${studentName} Joy` : 's Joy'} sx={{ textAlign: "center" }} />
            <CardContent>
                <LineChart num={day} stud={dataSource}/>
            </CardContent>
            <CardActions sx={{ textAlign: "center" }} >
                <Button onClick={() => changeDays(14)} variant="outlined">Last 14 days</Button>
                <Button onClick={() => changeDays(30)} variant="outlined">Last 30 days</Button>
                <Button onClick={() => changeDays(90)} variant="outlined">Last 90 days</Button>
            </CardActions>
        </Card>
    );
}