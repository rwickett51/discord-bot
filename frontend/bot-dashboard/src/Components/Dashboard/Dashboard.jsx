import React from 'react'
import "./Dashboard.css"

import TopItem from './TopItem'

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
                <div className="main-item a"></div>
                <div className="main-item b"></div>
                <div className="main-item c"></div>
                <div className="main-item d"></div>
                <div className="main-item e"></div>
            </div>
        </div>
    )
}
