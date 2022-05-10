import React from 'react';
import ProtocolData from './ProtocolData.js';
import UserData from './UserData.js';
import RateConverter from "../utils/rateConverter.js";

export default class GeneralData extends React.Component {

    constructor(props) {
        super(props);
    }
    
    componentDidMount = async () => {
    }

    render(){
        return(
            <div className='GeneralDataContainer'>
                <div className="flux">General data </div>
                <div className='GeneralData'>
                    <ProtocolData />
                    <UserData tokenInstance={this.props.tokenInstance} />
                </div>
            </div>
        )
    }
}