import { ActualUtilizationProfileValues } from '../../utils/constants';

//PrometheusCPUUsage: instance:node_cpu:rate:sum (metric available in OpenShift by default)
//PrometheusCPUPSIPressure: rate(node_pressure_cpu_waiting_seconds_total[1m]) (node_pressure_cpu_waiting_seconds_total is reported in OpenShift only for nodes configured with psi=1 kernel argument)
//PrometheusCPUPSIPressureByUtilization: avg by (instance) ( rate(node_pressure_cpu_waiting_seconds_total[1m])) and (1 - avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[1m]))) > 0.7 or avg by (instance) ( rate(node_pressure_cpu_waiting_seconds_total[1m])) * 0 (node_pressure_cpu_waiting_seconds_total is reported in OpenShift only for nodes configured with psi=1 kernel argument; the query is filtering out PSI pressure on nodes with average CPU utilization < 0.7 to filter out false positives pressure spikes due to self imposed CPU throttling)
//PrometheusMemoryPSIPressure: rate(node_pressure_memory_waiting_seconds_total[1m]) (node_pressure_memory_waiting_seconds_total is reported in OpenShift only for nodes configured with psi=1 kernel argument)
//PrometheusIOPSIPressure: rate(node_pressure_io_waiting_seconds_total[1m]) (node_pressure_memory_waiting_seconds_total is reported in OpenShift only for nodes configured with psi=1 kernel argument)

export const options = [
  {
    label: ActualUtilizationProfileValues.PrometheusCPUCombined,
    value: ActualUtilizationProfileValues.PrometheusCPUCombined,
  },
  {
    description: 'instance:node_cpu:rate:sum',
    label: ActualUtilizationProfileValues.PrometheusCPUUsage,
    value: ActualUtilizationProfileValues.PrometheusCPUUsage,
  },
  {
    description: 'rate(node_pressure_cpu_waiting_seconds_total[1m])',
    label: ActualUtilizationProfileValues.PrometheusCPUPSIPressure,
    value: ActualUtilizationProfileValues.PrometheusCPUPSIPressure,
  },
  {
    description:
      'avg by (instance) (rate(node_pressure_cpu_waiting_seconds_total[1m])) and (1 - avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[1m]))) > 0.7 or avg by (instance) (rate(node_pressure_cpu_waiting_seconds_total[1m])) * 0',
    label: ActualUtilizationProfileValues.PrometheusCPUPSIPressureByUtilization,
    value: ActualUtilizationProfileValues.PrometheusCPUPSIPressureByUtilization,
  },
  {
    description: 'rate(node_pressure_memory_waiting_seconds_total[1m])',
    label: ActualUtilizationProfileValues.PrometheusMemoryPSIPressure,
    value: ActualUtilizationProfileValues.PrometheusMemoryPSIPressure,
  },
  {
    description: 'rate(node_pressure_io_waiting_seconds_total[1m])',
    label: ActualUtilizationProfileValues.PrometheusIOPSIPressure,
    value: ActualUtilizationProfileValues.PrometheusIOPSIPressure,
  },
];
