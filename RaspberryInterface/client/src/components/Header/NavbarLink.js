import { Component } from "react";
import styles from "../../styles/component_styles/Navbar/NavbarLink.module.css";
import { AiOutlineHome, AiOutlineSetting } from "react-icons/ai";
import { SiHomebrew } from "react-icons/si";
import { ImStatsBars } from "react-icons/im";
import { Link } from "react-router-dom";

export default class NavbarLink extends Component{
    constructor(props){
        super(props);
        this.state = {
            active: false
        }
    }


    selectIcon = () => {
        switch(this.props.icon){
            case "home":
                return <AiOutlineHome/>

            case "setting":
                return <AiOutlineSetting/>

            case "stats":
                return <ImStatsBars/>
            default:
                return <SiHomebrew/>
        }
    }

    render(){
        return(
            <Link to={this.props.path}>
                <div className={this.props.active ? styles.link + " " + styles.active : styles.link}
                 onClick={this.props.handleClick} id={this.props.path}>
                    <div className={styles.iconContainer}>{this.selectIcon()}</div>
                    <div className={styles.nameContainer}>{this.props.name}</div>
                </div>
            </Link>
        )
    }
}