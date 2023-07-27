import { Component } from 'react';
import styles from '../styles/routeStyles/home.module.css';
import Chart from "chart.js/auto";
import { Line } from 'react-chartjs-2';
import DropdownContainer from '../components/Dropdown/DropdownContainer';


class Homepage extends Component {
  constructor(props){
    super(props);
    this.state = {
      labels: [],
      /* Dataset: {
        label: name,
        data: [{x: date, y: value}...]
        borderColor: color
        backgroundColor: color
      } */
      datasets: [],
      selectedDatasets: {},
      selectedTimeframe: "24"
    }
    this.colors = ["#2192FF", "#38E54D", "#00ADB5", "#FF2E63", "#FDFF00", "#00FFD1",
                    "#D800A6", "#D61C4E"];
  }

  appendLabels = (prevLabels, labels) => {
    let newLabels = [...prevLabels];
    for(let i = 0; i < labels; i++){
      if(prevLabels.indexOf(labels[i]) < 0){
        newLabels.push(labels[i]);
      }
    }
    newLabels.sort((a, b) => {
      let n = new Date(a).getTime();
      let m = new Date(b).getTime();
      return n < m ? -1 : n === m ? 0 : 1;
    });
    return newLabels;
  }

  appendDatasets = (prevDatasets, label, x, y, options) => {
    prevDatasets.push(
      {
        label: label, 
        data: y.map((yValue, index) => {
        return {x: x[index], y: yValue};
        }),
        borderColor: this.colors[prevDatasets.length],
        backgroundColor: this.colors[prevDatasets.length],
        ...options
      }
    );
    return prevDatasets;
  }

  clearGraph = () => {
    this.setState({
      labels: [],
      datasets: []
    })
  }

  handleDatasetsRowClick = (row) => {
    let d = row.id.split("-");
    let controller = d[0];
    let dataset = d[1];
    // if the clicked row has been selected previously, rerender it without selected in classname
    if (this.state.selectedDatasets[row.id]) {
      let selectedDatasets = {...this.state.selectedDatasets };
      selectedDatasets[row.id] = false;
      // remove it from the list of the selected datasets
      if(dataset === "DHT11"){
        // remove the DHT11 datasets and labels from the chart
        this.setState((prevState, props) => {
          let datasets = prevState.datasets;
          let labels = prevState.labels;
          // find all labels that are only contained in the DHT datasets and nowhere else
          // and remove them, since they are no longer necessary
          labels = labels.filter(label => {
            let onlyInHumidities = true;
            for(let dset in datasets){
              if(datasets[dset].data.find(xypair => {
                return xypair.x === label;}
                )){
                onlyInHumidities = false;
              }
            }
            return !(onlyInHumidities);
          })
          // remove the actual DHT11 data from the chart
          datasets = datasets.filter(dset => {
            return dset.label !==  `${controller}-DHT11-Humidities` && dset.label !== `${controller}-DHT11-Temperatures`;
          })
          // update the state
          return {
            labels: labels,
            datasets: datasets,
            selectedDatasets: selectedDatasets
          };
        })
      }
      // If it isn't a DHT dataset it's a plant dataset
      else{
        this.setState((prevState, props) => {
          let datasets = prevState.datasets;
          let labels = prevState.labels;
          // find all labels that are only contained in the DHT datasets and nowhere else
          // and remove them, since they are no longer necessary
          labels = labels.filter(label => {
            let onlyInPlant = true;
            for(let dset in datasets){
              if(datasets[dset].data.find(xypair => {
                return xypair.x === label;}
                )){
                onlyInPlant = false;
              }
            }
            return !(onlyInPlant);
          })
          // remove the actual Plant data from the chart
          datasets = datasets.filter(dset => {
            return dset.label !==  row.id;
          })
          // update the state
          return {
            labels: labels,
            datasets: datasets,
            selectedDatasets: selectedDatasets
          };
        })
      }
    }
    // rerender the graph with the newly selected dataset included
    else {
      let selectedDatasets = {...this.state.selectedDatasets};
      selectedDatasets[row.id] = true;
      if(dataset === "DHT11"){
        fetch(`http://website-api.local/Home/Datasets/DHT11/${controller}`)
        .then(response => {
          return response.json();
        })
        .then(responseData => {
          const labels = responseData.labels;
          const humidities = responseData.humidities;
          const temperatures = responseData.temperatures;
          // append the labels to the state
          // this.state.labels.slice creates a copy of the previous state's labels
          const newLabels = this.appendLabels(this.state.labels.slice(), labels);
          let newDatasets = [...this.state.datasets.slice()]
          newDatasets = this.appendDatasets(newDatasets,
            `${controller}-DHT11-Humidities`, labels, humidities);

          newDatasets = this.appendDatasets(newDatasets,
            `${controller}-DHT11-Temperatures`, labels, temperatures);
          this.setState(
            {
              labels: newLabels,
              datasets: newDatasets,
              selectedDatasets: selectedDatasets
            });
        })
        .catch(err => {
          console.log(err);
        })
      }
      // add plant dataset to chart
      else{
        const plant_id = d[2];
        fetch(`http://website-api.local/Home/Datasets/Plants/${plant_id}`)
        .then(response => {
          return response.json();
        })
        .then(responseData => {
          const labels = responseData.labels;
          const averages = responseData.averages;
          const wasWatered = responseData.wasWatered;
          const newLabels = this.appendLabels(this.state.labels.slice(), labels);
          let newDatasets = [...this.state.datasets.slice()];
          newDatasets = this.appendDatasets(newDatasets, row.id,
            labels, averages, {
              pointBackgroundColor: wasWatered.map(watered => {
                return watered ? "#FFFFFF" : this.colors[newDatasets.length];
              })  
          });
          this.setState({
            labels: newLabels,
            datasets: newDatasets,
            selectedDatasets: selectedDatasets
          });
        })
      }
    }
  }

  handleTimeframesRowClick = (row) => {
    if(this.state.selectedTimeframe !== row.id){
      // clear the graph
      this.setState({
        selectedTimeframe: row.id
      });
    }
  }

  // move selected datasets up here
  render() {
    return (
      <div className={styles.Home}>
        <DropdownContainer handleDatasetsRowClick={this.handleDatasetsRowClick}
        handleTimeframesRowClick={this.handleTimeframesRowClick} 
        selectedDatasets={this.state.selectedDatasets}
        selectedTimeframe={this.state.selectedTimeframe}/>

        <div className={styles.chartContainer}><Line data={{
          labels: this.state.labels,
          datasets: this.state.datasets
        }}
        options={{
          elements: {
            point: {
              radius: 5,
              hitRadius: 8
            },
          },
          scales: {
            y: {
             beginAtZero: true,
             ticks: {
              color: "#EEE"
             }
            },
            x: {
              ticks: {
                color: "#EEE"
              }
            }
          },
          plugins:{
            legend: {
              labels: {
                color: "#EEE"
              }
            }
          }
        }}></Line></div>
      </div>
    )
  }
}

export default Homepage;
