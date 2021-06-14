import React from 'react'
import "./TopItem.css"

import { AiOutlineUser, AiFillBug, AiOutlineFieldTime, AiOutlineSmile } from 'react-icons/ai';
import { BsClipboard, BsChatSquare } from "react-icons/bs";

export default function TopItem(props) {

    const getTypeName = (type) => {
        switch(type) {
            case 1:
                return <h6><AiOutlineUser /> Total Users</h6>
            case 2:
                return <h6><BsChatSquare/> Total Servers</h6>
            case 3:
                return <h6><BsClipboard /> Total Requests</h6>
            case 4:
                return <h6><AiOutlineFieldTime /> Total Time</h6>
            case 5:
                return <h6><AiOutlineSmile /> Total Dad Jokes</h6>
            case 6:
                return <h6><AiFillBug /> Total Errors</h6>
            default:
                return <h6>Error</h6>
        }
    }

    //TODO: Change type to retrieved value
    const type = {type: props.type, name: getTypeName(props.type)};
    return (
        <div className="dashboard-top-item">
            {type.name}
            <p className="dashboard-top-item-value">{type.type}</p>
        </div>
    )
}


