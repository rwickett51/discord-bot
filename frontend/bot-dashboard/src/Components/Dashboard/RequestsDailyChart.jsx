import React, {useEffect, useState} from 'react'
import axios from 'axios'
import {ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid} from "recharts"
import {format, parseISO} from "date-fns"

export default function RequestDailyChart() {

    const [data, setData] = useState([])

    useEffect(() => {
        const getRequests = async () => {
            const response = await axios.get("/api/analytics/dailyrequests")
            console.log(response.data)
            setData(response.data)
        }
        getRequests();
    }, [])

    if (data === null) {
        <div />
    } else {
        return (
            <>
                <h3>Daily Requests</h3>
                <ResponsiveContainer width="10  0%" height={550}>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="color" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#2451b7" stopOpacity={0.4}></stop>
                                <stop offset="90%" stopColor="#2451b7" stopOpacity={0.05}></stop>
                            </linearGradient>
                        </defs>
                        <Area dataKey="count" stroke="#2451B7" fill="url(#color)"/>
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tickFormatter={str => 
                            {
                                const date = parseISO(str)
                                if (date.getDate() % 7 === 0) {
                                    return format(date, "MMM, d")
                                }
                                return ""
                            }
                        }/>
                        <YAxis dataKey="count" axisLine={false} tickLine={false}/>
                        <Tooltip />
                        <CartesianGrid opacity={0.1} vertical={false}/>
                    </AreaChart>
                </ResponsiveContainer>
                
            </>
        )
    }
    
}
