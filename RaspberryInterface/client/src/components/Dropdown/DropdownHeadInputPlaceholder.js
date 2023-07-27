import { Component } from "react";
import styles from "../../styles/component_styles/Dropdown/DropdownHeadInput.module.css";


export default class DropdownHeadInputPlaceholder extends Component{
    render(){
        return (
            <div className={styles.placeholder}>{this.props.placeholder}</div>
        )
    }
}