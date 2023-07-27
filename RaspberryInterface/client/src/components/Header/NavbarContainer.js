import { Component } from "react";
import Navbar from "./Navbar";
import styles from "../../styles/component_styles/Navbar/NavbarContainer.module.css";

export default class NavbarContainer extends Component{
    render(){
        return(
            <>
            <div className={styles.container}>
                <Navbar links={this.props.links}></Navbar>
            </div>
            </>
        )
    }
}