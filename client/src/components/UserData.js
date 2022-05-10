import React from 'react';
import RateConverter from "../utils/rateConverter.js";
import DataContainer from './DataContainer.js';

export default class GeneralData extends React.Component {

    constructor(props) {
        super(props);
    }
    
    componentDidMount = async () => {
        
    }

    render(){
        return(
            <div className="UserData">
                <h3>User</h3>
                <DataContainer containerClass='DataContainer' indicatorTitle='Total Staked Amount' indicatorValue='0' indicatorUnit='USD'/>
                <DataContainer containerClass='DataContainer' indicatorTitle='Total Reward Amount' indicatorValue='0' indicatorUnit='USD'/>
            </div>
        )
    }
}