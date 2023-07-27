import { Component } from "react";
import styles from "../../styles/component_styles/Dropdown/DropdownRow.module.css";


export default class DropdownRow extends Component{
    render(){
        if(this.props.nestedRows){
            return (
                <div className={styles.row} id={this.props.rowName}>
                    <div className={styles.rowName}>{this.props.rowName}</div>
                    {this.props.nestedRows}
                </div>
            )
        }
        return (
            <div className={styles.row} id={this.props.rowName}>
                {this.props.rowName}
            </div>
        )
    }
}