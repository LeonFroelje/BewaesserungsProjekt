import { Component } from "react";
import styles from "../../styles/component_styles/Dropdown/DropdownBody.module.css";


export default class DropdownBody extends Component{
    render(){
        return(
            <div className={styles.body}>
                {this.props.rows}
            </div>
        );
    }
}