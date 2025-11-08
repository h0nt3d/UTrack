import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import TeamLineChart from './TeamLineChart.jsx';
import React from "react";

import { useLocation } from "react-router-dom";

export default function TeamCardC ({allStuds, num, team}) {

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

    return (
        <Card sx={{ maxWidth: 700, margin: 2, boxShadow: 3}}>
            <CardHeader title={team ? `${team}'s Joy` : 'Team Joy'} sx={{ textAlign: "center" }} />
            <CardContent>
                <TeamLineChart num={day} allStuds={dataSource}/>
            </CardContent>
            <CardActions sx={{ textAlign: "center" }} >
                <Button onClick={() => changeDays(14)} variant="outlined">Last 14 days</Button>
                <Button onClick={() => changeDays(30)} variant="outlined">Last 30 days</Button>
                <Button onClick={() => changeDays(90)} variant="outlined">Last 90 days</Button>
            </CardActions>
        </Card>
    );
}