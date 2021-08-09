import React from 'react';
import '../styles/navbar.scss';
// import logo from '../assets/nervos-logo.png';

interface Props {
    ethAccount?: string;
    polyAccount?: string;
}
function Navbar(props: Props) {
    const { ethAccount, polyAccount } = props;
    return (
        <div className="navbar">
            <div className="nav-header">
                <img
                    alt="logo"
                    src="https://assets-global.website-files.com/5f15b505dd58c1501a49d387/601dfcc5e1d269017d0079c4_Nervous%20Network%203D%20coin%20v4.png"
                />
                <h3>Nervos Ideas</h3>
            </div>
            <div className="nav-accounts">
                <span>
                    {' '}
                    <strong>ETH:</strong> {ethAccount || '-'}
                </span>
                <span>
                    <strong>PolyJuice</strong>
                    {polyAccount || '-'}
                </span>
            </div>
        </div>
    );
}

export default Navbar;
