import { Component } from "react";
import styles from "../../styles/component_styles/Dropdown/DropdownHead.module.css";
import DropdownHeadInput from "./DropdownHeadInput";


export default class DropdownHead extends Component{
    render(){
        return (
            <div className={styles.head}>
                <div className={styles.label}>{this.props.label}</div>
                <DropdownHeadInput toggleMenuDrop={this.props.toggleMenuDrop}
                    selectedItems={this.props.selectedItems}
                    dropped={this.props.dropped} placeholder={this.props.placeholder}>
                </DropdownHeadInput>
            </div>
        )
    }
}
