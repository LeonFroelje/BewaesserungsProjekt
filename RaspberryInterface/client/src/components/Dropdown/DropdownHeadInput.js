import { Component } from "react";
import styles from "../../styles/component_styles/Dropdown/DropdownHeadInput.module.css";
import { BsChevronDown, BsChevronUp } from "react-icons/bs"
import DropdownHeadInputPlaceholder from "./DropdownHeadInputPlaceholder";


export default class DropdownHeadInput extends Component{
    handleClick = () => {
        this.props.toggleMenuDrop();
    }

    render(){
        if(this.props.dropped){
            return(
                <div className={styles.headInput} onClick={this.props.toggleMenuDrop}>
                    <div className={styles.inputField}>
                        {this.props.selectedItems.length > 0 ? this.props.selectedItems.join(", ")
                            : <DropdownHeadInputPlaceholder placeholder={this.props.placeholder}/>}
                    </div>
                    <div className={styles.dropIcon}>
                        <BsChevronUp/>
                    </div>
                </div>
            );
        }
        else{
            return(
                <div className={styles.headInput} onClick={this.props.toggleMenuDrop}>
                    <div className={styles.inputField}>
                    {this.props.selectedItems.length > 0 ? this.props.selectedItems.join(", ")
                            : <DropdownHeadInputPlaceholder placeholder={this.props.placeholder}/>}                    </div>
                    <div className={styles.dropIcon}>
                        <BsChevronDown/>
                    </div>
                </div>
            );

        }
    }
}