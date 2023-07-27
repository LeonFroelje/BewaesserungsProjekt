import { Component } from "react";
import styles from "../../styles/component_styles/Navbar/Navbar.module.css"
import NavbarLink from "./NavbarLink";
import Warning from "./Warnings";

export default class Navbar extends Component{
    constructor(props){
        super(props);
        this.state = {
            active: window.location.pathname
        };
    }

    linkClicked = (e) => {
        this.setState({
            active: e.currentTarget.id
        });
    }

    render(){
        const links = this.props.links.map(link => {
            return this.state.active === link.path 
            ? <NavbarLink active={true} key={link.path} path={link.path}
                 name={link.name} icon={link.icon} handleClick={this.linkClicked} ></NavbarLink>
            : <NavbarLink active={false} key={link.path} path={link.path} name={link.name}
                 icon={link.icon} handleClick={this.linkClicked} ></NavbarLink>
        });
        return (
            <>
            <div className={styles.linkContainer}>{links}</div>
            <Warning></Warning>
            </>
        )
    }
}