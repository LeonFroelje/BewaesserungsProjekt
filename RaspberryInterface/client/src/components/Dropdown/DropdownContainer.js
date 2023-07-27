import { Component } from "react";
import DatasetsDropdown from "../DatasetsDropdown/DatasetsDropdown";
import DateDropdown from "../DateDropdown/DateDropdown";
import styles from "../../styles/component_styles/Dropdown/DropdownContainer.module.css"

export default class DropdownContainer extends Component{
    render(){
        return(
        <div className={styles.container}>
            <DatasetsDropdown handleRowClick={this.props.handleDatasetsRowClick}
            selectedRows={this.props.selectedDatasets}/>

            <DateDropdown rows={[{name:"leeel"}, {name:"luuul"}, {name:"laaal"},
                                 {name:"loool"}, {name:"lüüül"}, {name:"läääl"}]}
            handleRowClick={this.props.handleTimeframesRowClick}
            selectedRow={this.props.selectedTimeframes}/>
        </div>
        )
    }
}