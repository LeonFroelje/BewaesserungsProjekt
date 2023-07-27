import { Component } from "react";
import styles from "../../styles/component_styles/Dropdown/SelectableDropdownRow.module.css";

export default class SelectableDropdownRow extends Component{
    handleClick = (e) => {
        this.props.handleRowClick(e.target);
    }
    
    render(){
        if(this.props.selected){
            return(
                <div className={styles.row + " " + styles.selected}
                id={this.props.rowName} onClick={this.handleClick}>
                   {this.props.rowContent}
               </div>

            )
        }
        return(
            <div className={styles.row}
             id={this.props.rowName} onClick={this.handleClick}>
                {this.props.rowContent}
            </div>
            );
    }
}