import React, {useEffect, useState} from 'react'
import "./TopItem.css"
import axios from "axios";
import _ from "lodash"

import { AiOutlineUser, AiFillBug, AiOutlineFieldTime, AiOutlineSmile } from 'react-icons/ai';
import { BsClipboard, BsChatSquare } from "react-icons/bs";

export default function TopItem(props) {
    const [value, setValue] = useState(null);

    const getUptime = async () => {
        try {
            const response = await axios.get("/api/analytics/uptime")
            return response.data.time;
        } catch(error) {
            return 'Error'
        }
    }

    const getUsers = async () => {
        try {
            const response = await axios.get("/api/analytics/users")
            return response.data.users;
        } catch(error) {
            return 'Error'
        }
    }

    const getServers = async () => {
        try {
            const response = await axios.get("/api/analytics/servers")
            return response.data.servers;
        } catch(error) {
            return 'Error'
        }
    }

    const getRequests = async () => {
        try {
            const response = await axios.get("/api/analytics/requests")
            return response.data.requests;
        } catch(error) {
            return 'Error'
        }
    }

    const getDadjokes = async () => {
        try {
            const response = await axios.get("/api/analytics/dadjokes")
            return response.data.dadjokes;
        } catch(error) {
            return 'Error'
        }
    }

    useEffect(() => {
        console.log(props.type)
        const f = async () => {
            switch(props.type) {
                case 1:
                    setValue(await getUsers())
                    break;
                case 2:
                    setValue(await getServers())
                    break;
                case 3:
                    setValue(await getRequests())
                    break;
                case 4:
                    setValue(await getUptime())
                    break;
                case 5:
                    setValue(await getDadjokes())
                    break;
                case 6:
                    setValue('N/A')
                    break;
                default:
                    setValue("Error")
            }
        }
        f();

    }, [])

    const getTitle = () => {
        switch(props.type) {
            case 1:
                return {icon: <AiOutlineUser />, title: `Total Users`}
            case 2:
                return {icon: <BsChatSquare/>, title: `Total Servers`}
            case 3:
                return {icon: <BsClipboard />, title: `Total Requests`}
            case 4:
                return {icon: <AiOutlineFieldTime />, title: `Uptime`}
            case 5:
                return {icon: <AiOutlineSmile />, title: `Total Dad Jokes`}
            case 6:
                return {icon: <AiFillBug />, title: `Total Errors`}
            default:
                return {icon: <></> ,title: 'Error'}
        }
    }
    


    //TODO: Change type to retrieved value
    const title = getTitle()
    if (value === null) {
        return <div className="dashboard-top-item">
                <h6>{title.icon} {title.title}</h6>
                <p className="dashboard-top-item-value"></p>
            </div>
    }
     else {
        return (
            <div className="dashboard-top-item">
                <h6>{title.icon} {title.title}</h6>
                <p className="dashboard-top-item-value">{value}</p>
            </div>
        )
    }
    
}


