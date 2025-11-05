import {Line} from 'react-chartjs-2'
import 'chartjs-adapter-date-fns';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js'
import React from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
)

export default function LineChart ({stud, num}) {

    const [displayChart, setDisplayChart] = React.useState(true)

    function formattingDay (day) {
        const year = day.getFullYear();
        const month = String(day.getMonth() + 1).padStart(2, '0');
        const date = String(day.getDate()).padStart(2, '0');
        return `${year}-${month}-${date}`;
    }

    const today = new Date()
    const firstDay = new Date(today)
    firstDay.setDate(today.getDate() - num)

    // Use stud prop if provided, otherwise fall back to sample data
    const dataSource = stud;

    const filterData = dataSource.filter(item => {
        const itemD = new Date(item.x)
        return itemD >= firstDay && itemD <= today
    })
 
    
    React.useEffect(() => {
        if (filterData.length == 0) {
            setDisplayChart(false)
        }
        else {
            setDisplayChart(true)
        }
    }, [filterData])


    return (
        displayChart ? (
            <Line
                data ={{
                    datasets: [
                        {
                            label: 'Joy',
                            data: filterData,
                            borderColor: '#8EEAFF',
                            pointBackgroundColor: "#FFB74D",
                            pointBorderColor: "#FF5722",
                            fill: false,
                            pointRadius: 5,
                            pointHoverRadius: 7,
                        },
                    ],
                }}
                options = {{
                    maintainAspectRatio: true,
                    responsive: true,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                title: function (context) {
                                    return `${context[0].raw.x}`
                                },
                                label: function (context) {  
                                    return  `Day: ${context.raw.x}, Avg: ${context.raw.y}`
                                },
                            }
                        }
                    },
                    scales: {
                        x: {
                            type: 'time',
                            time: {unit: 'day'},
                            min: firstDay,
                            max: today
                        },
                        y: {
                            beginAtZero: true,
                            suggestedMax: 5,
                        },
                    },
                }}
                height= {400}
                width= {600}
            />
        )
        : (
            <div>No entries in this range.</div>
        )
    )
}