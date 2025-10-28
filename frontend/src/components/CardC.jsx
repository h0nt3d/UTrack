import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardHeader from "@mui/material/CardHeader"
import CardActions from "@mui/material/CardActions"
import Button from "@mui/material/Button"
import LineChart from '../subcomponents/LineChart.jsx'
import React from "react"

export default function CardC () {

    const [day, setDay] = React.useState(14)

    function changeDays(x){
        setDay(x)
    }

    return (
        <Card sx={{ maxWidth: 700, margin: 2, boxShadow: 3}}>
            <CardHeader title="Course Joy"/>
            <CardContent>
                <LineChart num={day}/>
            </CardContent>
            <CardActions>
                <Button onClick={() => changeDays(14)} variant="outlined">Last 14 days</Button>
                <Button onClick={() => changeDays(30)} variant="outlined">Last 30 days</Button>
                <Button onClick={() => changeDays(90)} variant="outlined">Last 90 days</Button>
            </CardActions>
        </Card>
    )
}