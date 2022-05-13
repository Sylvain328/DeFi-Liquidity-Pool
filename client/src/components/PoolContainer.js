import React from 'react';
import LiquidityPool from './LiquidityPool.js';

export default class PoolContainer extends React.Component {

    render(){

        return(
            <div className='PoolPart'>
                <div className="flux">Liquidity pools</div>
                <div className='PoolContainer'>
                    {
                        Object.entries(this.props.poolManager.pools).map(([key,value])=>{
                            return <LiquidityPool key={key} liquidityPool={value} updateAllPoolsData={this.props.updateAllPoolsData} />
                        })
                    }
                </div>
            </div>

        )
    }
}