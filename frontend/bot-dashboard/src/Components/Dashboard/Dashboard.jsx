import React from 'react'
import "./Dashboard.css"

import TopItem from './TopItem'
import RequestsChart from './RequestsChart'
import RequestDailyChart from './RequestsDailyChart'

export default function Dashboard() {
    return (
        <div className="dashboard-container">
            <div className="dashboard-top">
                <TopItem type={1}/>
                <TopItem type={2}/>
                <TopItem type={3}/>
                <TopItem type={4}/>
                <TopItem type={5}/>
                <TopItem type={6}/>
            </div>
            <div className="dashboard-main">
                <div className="main-item a"><RequestsChart/></div>
                <div className="main-item b"><RequestDailyChart/></div>
                <div className="main-item c"></div>
                <div className="main-item d"></div>
                <div className="main-item e"></div>
            </div>
        </div>
    )
}
