// /public/utils/charts.js

import { getColor } from './chartColorScheme.js';

// --- GLOBAL DEFAULTS ---
const CHART_DEFAULTS = {
    fontFamily: "'Roboto', sans-serif",
    fontColor: '#2b2b2b',
};

// --- PER-GRAPH CUSTOMIZATION CONFIG ---
const graphConfig = {
    'hymn-distribution-mandala': {
        mode: 'simple',
        labelKey: 'mandala_num', valueKey: 'hymn_count',
        colorScheme: 'mandala', yAxisLabel: 'Hymn Count',
        labelPrefix: 'Mandala ',
        dimensions: { bar: '500px' },
        dataLimit: 10,
        pieThreshold: 10
    },
    'deity-distribution-mandala': {
        mode: 'stacked',
        primaryKey: 'mandala_num', secondaryKey: 'deities',
        labelKey: 'deity_name', valueKey: 'hymn_count',
        colorScheme: 'deity', yAxisLabel: 'Hymn Count',
        primaryLabelPrefix: 'Mandala ', filterLabel: 'Mandala',
        dimensions: { bar: '600px', multiPie: '550px' },
        dataLimit: 10
    },
    'rishi-distribution-mandala': {
        mode: 'stacked',
        primaryKey: 'mandala_num', secondaryKey: 'rishis',
        labelKey: 'rishi_name', valueKey: 'hymn_count',
        colorScheme: 'rishi', yAxisLabel: 'Hymn Count',
        primaryLabelPrefix: 'Mandala ', filterLabel: 'Mandala',
        dimensions: { bar: '600px', multiPie: '550px' },
        dataLimit: 10,
        shortenLabels: true
    },
    'meter-distribution-global': {
        mode: 'simple',
        labelKey: 'meter', valueKey: 'totalCount',
        colorScheme: 'meter', yAxisLabel: 'Stanza Count',
        dimensions: { bar: '500px' },
        dataLimit: 10,
        pieThreshold: 20
    },
    'meter-distribution-mandala': {
        mode: 'stacked',
        primaryKey: 'mandala_num', secondaryKey: 'meters',
        labelKey: 'meter', valueKey: 'totalCount',
        colorScheme: 'meter', yAxisLabel: 'Stanza Count',
        primaryLabelPrefix: 'Mandala ', filterLabel: 'Mandala',
        dimensions: { bar: '600px', multiPie: '550px' },
        dataLimit: 10
    },
    'meter-distribution-deity': {
        mode: 'stacked',
        primaryKey: 'deity_name', secondaryKey: 'meters',
        labelKey: 'meter', valueKey: 'totalCount',
        colorScheme: 'meter', yAxisLabel: 'Stanza Count',
        filterLabel: 'Deity',
        sort: true,
        dimensions: { bar: '700px', multiPie: '550px' },
        dataLimit: 10
    },
    'hymn-count-deity': {
        mode: 'simple',
        labelKey: 'deity_name', valueKey: 'hymn_count',
        colorScheme: 'deity', yAxisLabel: 'Hymn Count',
        sort: true,
        dimensions: { bar: '500px' },
        dataLimit: 10,
        pieThreshold: 10
    },
    'hymn-count-rishi': {
        mode: 'simple',
        labelKey: 'rishi_name', valueKey: 'hymn_count',
        colorScheme: 'rishi', yAxisLabel: 'Hymn Count',
        sort: true,
        dimensions: { bar: '500px' },
        dataLimit: 10,
        pieThreshold: 15,
        excludeFromBar: ['Others'],
        shortenLabels: true
    },
    'rishi-deity-association': {
        mode: 'stacked',
        transformData: true,
        primaryKey: 'rishi_name', secondaryKey: 'associated_deities',
        labelKey: 'deity_name', valueKey: 'hymn_count',
        colorScheme: 'deity', yAxisLabel: 'Hymn Count',
        filterLabel: 'Rishi',
        sort: true,
        dimensions: { bar: '700px', multiPie: '550px' },
        dataLimit: 10,
        shortenLabels: true
    },
    // --- NEW: Configs for Section 3 (Word Distribution) ---
    'word-distribution-global': {
        mode: 'treemap',
        valueKey: 'frequency',
        labelKey: 'word',
        secondaryKey: 'letter_count',
        dataLimit: 50,
        valueThreshold: 5,
        dimensions: { treemap: '700px' }
    },
    'word-distribution-mandala': {
        mode: 'treemap',
        primaryKey: 'mandala_num',
        valueKey: 'frequency',
        labelKey: 'word',
        secondaryKey: 'letter_count',
        dataLimit: 50,
        dimensions: { treemap: '700px' }
    },
    'word-distribution-deity': {
        mode: 'treemap',
        primaryKey: 'deity_name',
        valueKey: 'frequency',
        labelKey: 'word',
        secondaryKey: 'letter_count',
        dataLimit: 50,
        dimensions: { treemap: '700px' }
    },
};

let chartInstance = null;
let pieChartInstances = [];

Chart.register(ChartDataLabels);

export function renderVisuals(config) {
    let { chartType, data: rawData, graphType } = config;
    const cfg = graphConfig[graphType];
    if (!cfg) { console.error(`No config found for ${graphType}`); return {}; }

    if (cfg.transformData) {
        rawData = transformRishiDeityData(rawData);
    }

    destroyAllCharts();

    const isTreemap = cfg.mode === 'treemap';
    const generatedTitle = generateChartTitle(graphType, isTreemap ? 'Treemap' : chartType);
    let requiredHeight, isMultiPie = false;

    if (isTreemap) {
        renderTreemap({ data: rawData, cfg, graphType });
        requiredHeight = cfg.dimensions.treemap;
        document.getElementById('treemap-filters-container').classList.remove('hidden');
        document.getElementById('custom-legend-container').classList.add('hidden');
    } else {
        document.getElementById('treemap-filters-container').classList.add('hidden');
        if (chartType === 'bar' && cfg.excludeFromBar) {
            rawData = rawData.filter(item => !cfg.excludeFromBar.includes(item[cfg.labelKey]));
        }

        const sortedData = cfg.sort ? sortRawData(rawData, cfg) : rawData;
        const processedData = processData(sortedData, cfg);
        isMultiPie = chartType === 'pie' && cfg.mode === 'stacked';

        if (isMultiPie) {
            renderMultiPieCharts(processedData, cfg);
            requiredHeight = cfg.dimensions.multiPie;
        } else {
            renderSingleChart(processedData, cfg, chartType, graphType);
            requiredHeight = cfg.dimensions.bar;
        }
    }

    return { requiredHeight, chartTitle: generatedTitle, isMultiPie, isTreemap };
}

export function destroyAllCharts() {
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
    pieChartInstances.forEach(chart => chart.destroy());
    pieChartInstances = [];
}

// ====================================================
// =========== TREEMAP RENDERING FUNCTIONS ============
// ====================================================

function renderTreemap({ data, cfg, graphType }) {
    const filtersContainer = document.getElementById('treemap-filters-container');
    filtersContainer.innerHTML = '';

    // Setup primary filter (e.g., by Mandala, by Deity)
    if (cfg.primaryKey) {
        let options = [...new Set(data.map(item => item[cfg.primaryKey]))];
        if (typeof options[0] === 'number') options.sort((a, b) => a - b);
        else options.sort();

        let label = cfg.primaryKey.replace('_num', '').replace('_name', '');
        createFilterDropdown('primary-filter', `${label}:`, options, filtersContainer);
    }

    // Setup secondary filter (Letter Count)
    let letterCountOptions = ['All', ...[...new Set(data.map(item => item[cfg.secondaryKey]))].sort((a,b) => a-b)];
    createFilterDropdown('secondary-filter', 'Letters:', letterCountOptions, filtersContainer);

    const updateChart = () => {
        const primaryFilter = document.getElementById('primary-filter');
        const secondaryFilter = document.getElementById('secondary-filter');

        const primaryValue = primaryFilter ? primaryFilter.value : null;
        const secondaryValue = secondaryFilter ? secondaryFilter.value : null;

        let filteredData = data;

        if (primaryValue) {
            filteredData = filteredData.filter(d => d[cfg.primaryKey] == primaryValue);
        }
        if (secondaryValue && secondaryValue !== 'All') {
            filteredData = filteredData.filter(d => d[cfg.secondaryKey] == secondaryValue);
        }

        if (cfg.valueThreshold) {
        filteredData = filteredData.filter(d => d[cfg.valueKey] >= cfg.valueThreshold);
    }

        const finalData = filteredData
            .sort((a, b) => b[cfg.valueKey] - a[cfg.valueKey])
            .slice(0, cfg.dataLimit);

        drawTreemap(finalData, cfg, graphType);
    };

    filtersContainer.querySelectorAll('select').forEach(sel => sel.addEventListener('change', updateChart));
    updateChart(); // Initial draw
}

function createFilterDropdown(id, labelText, options, container) {
    const filterContainer = document.createElement('div');
    filterContainer.id = `${id}-container`;
    const label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = labelText;
    const select = document.createElement('select');
    select.id = id;
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = (labelText.toLowerCase().includes('mandala') && opt !== 'All') ? `Mandala ${opt}` : opt;
        select.appendChild(option);
    });
    filterContainer.appendChild(label);
    filterContainer.appendChild(select);
    container.appendChild(filterContainer);
}

function drawTreemap(chartData, cfg, graphType) {
    if (chartInstance) chartInstance.destroy();

    const canvas = document.getElementById('insight-chart');
    const values = chartData.map(d => d[cfg.valueKey]);
    const min = Math.min(...values);
    const max = Math.max(...values);

    const getFontSize = value => (max === min) ? 16 : ((value - min) / (max - min)) * 30 + 12;
   const colorScale = value => {
    if (max === min) return `hsl(28, 55%, 35%)`; // base warm brown-orange
    const percentage = (value - min) / (max - min);
    const hue = 28 - (percentage * 20);         // brown → dark red
    const lightness = 40 - (percentage * 10);   // gets darker
    return `hsl(${hue}, 60%, ${lightness}%)`;
};


    chartInstance = new Chart(canvas.getContext('2d'), {
        type: 'treemap',
        data: {
            datasets: [{
                tree: chartData,
                key: cfg.valueKey,
                backgroundColor: ctx => (ctx.type === 'data') ? colorScale(ctx.raw.v) : 'transparent',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                borderWidth: 1.5,
                labels: {
                    display: true,
                    align: 'center',
                    position: 'middle',
                    color: 'white',
                    font: ctx => ({
                        size: (ctx.type === 'data') ? getFontSize(ctx.raw.v) : 0,
                        weight: 'bold',
                        family: CHART_DEFAULTS.fontFamily,
                    }),
                    formatter: ctx => {
                        if (ctx.type !== 'data') return;
                        const item = ctx.raw._data;
                        // Show frequency only if there's enough space
                        return getFontSize(ctx.raw.v) > 14 ? [item[cfg.labelKey], `(${item[cfg.valueKey]})`] : item[cfg.labelKey];
                    }
                }
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 0 },
            plugins: {
                title: {
                    display: true,
                    text: generateChartTitle(graphType, 'Treemap'),
                    font: { size: 18 }, color: CHART_DEFAULTS.fontColor, padding: { bottom: 20 }
                },
                datalabels: {display: false },
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: ctx => ctx[0].raw._data[cfg.labelKey],
                        label: ctx => `Frequency: ${ctx.raw.v.toLocaleString()}`
                    }
                }
            }
        }
    });
}

// ====================================================
// ======== BAR & PIE CHART RENDERING FUNCTIONS =======
// ====================================================

function shortenLabel(label) {
    if (typeof label !== 'string') return label;
    return label.split(' ')[0];
}

function transformRishiDeityData(data) {
    return data.map(rishi => {
        const deitiesArray = Object.entries(rishi.associated_deities).map(([deityName, details]) => ({
            deity_name: deityName,
            hymn_count: details.hymn_count
        }));
        return {
            rishi_name: rishi.rishi_name,
            associated_deities: deitiesArray
        };
    });
}

function sortRawData(data, cfg) {
    if (cfg.mode === 'simple') {
        return [...data].sort((a, b) => b[cfg.valueKey] - a[cfg.valueKey]);
    }
    return [...data].sort((a, b) => {
        const totalA = (a[cfg.secondaryKey] || []).reduce((sum, item) => sum + item[cfg.valueKey], 0);
        const totalB = (b[cfg.secondaryKey] || []).reduce((sum, item) => sum + item[cfg.valueKey], 0);
        return totalB - totalA;
    });
}

function processData(rawData, cfg) {
    const otherEntitiesThreshold = 5;

    if (cfg.mode === 'simple') {
        let labels = rawData.map(item => `${cfg.labelPrefix || ''}${item[cfg.labelKey]}`);
        if (cfg.shortenLabels) {
            labels = labels.map(shortenLabel);
        }

        const datasets = [{
            label: cfg.yAxisLabel || 'Count',
            data: rawData.map(item => item[cfg.valueKey]),
            backgroundColor: rawData.map((item) => getColor(cfg.colorScheme, item[cfg.labelKey])),
        }];

        let legendData = rawData.map((item) => ({ label: `${cfg.labelPrefix || ''}${item[cfg.labelKey]}`, color: getColor(cfg.colorScheme, item[cfg.labelKey]) }));
        if(cfg.shortenLabels) {
            legendData.forEach(item => item.label = shortenLabel(item.label));
        }

        return { labels, datasets, legendData, primaryCategories: rawData };
    }

    const processedItems = rawData.map(primaryItem => {
        const mainEntities = [];
        let othersCount = 0;
        (primaryItem[cfg.secondaryKey] || []).forEach(secondaryItem => {
            if (secondaryItem[cfg.valueKey] < otherEntitiesThreshold || secondaryItem[cfg.labelKey] === 'Others') {
                othersCount += secondaryItem[cfg.valueKey];
            } else {
                mainEntities.push(secondaryItem);
            }
        });
        if (othersCount > 0) {
            mainEntities.push({ [cfg.labelKey]: "Others", [cfg.valueKey]: othersCount });
        }
        return { ...primaryItem, [cfg.secondaryKey]: mainEntities };
    });

    const allSubCategories = [...new Set(processedItems.flatMap(item => item[cfg.secondaryKey].map(sub => sub[cfg.labelKey])))];
    if (allSubCategories.includes('Others')) {
        allSubCategories.splice(allSubCategories.indexOf('Others'), 1);
        allSubCategories.push('Others');
    }

    let labels = processedItems.map(item => `${cfg.primaryLabelPrefix || ''}${item[cfg.primaryKey]}`);
    if (cfg.shortenLabels) {
        labels = labels.map(shortenLabel);
    }

    const datasets = allSubCategories.map(subCategoryName => ({
        label: subCategoryName,
        data: processedItems.map(primaryItem => {
            const item = primaryItem[cfg.secondaryKey].find(i => i[cfg.labelKey] === subCategoryName);
            return item ? item[cfg.valueKey] : 0;
        }),
        backgroundColor: getColor(cfg.colorScheme, subCategoryName),
    }));

    const legendData = allSubCategories.map(name => ({ label: name, color: getColor(cfg.colorScheme, name) }));

    return { labels, datasets, legendData, primaryCategories: processedItems };
}

function renderSingleChart(processedData, cfg, chartDisplayType, graphType) {
    if (chartInstance) chartInstance.destroy();

    let finalLabels = [...processedData.labels];
    let finalDatasets = JSON.parse(JSON.stringify(processedData.datasets));
    let finalLegendData = [...processedData.legendData];

    if (cfg.mode === 'simple') {
        if (chartDisplayType === 'bar' && finalLabels.length > cfg.dataLimit) {
            const limit = cfg.dataLimit;
            finalLabels = finalLabels.slice(0, limit);
            finalDatasets[0].data = finalDatasets[0].data.slice(0, limit);
            finalLegendData = finalLegendData.slice(0, limit);
        } else if (chartDisplayType === 'pie' && cfg.pieThreshold) {
            const originalData = processedData.primaryCategories;
            let othersSum = 0;

            if (graphType === 'hymn-count-rishi') {
                const othersRishi = originalData.find(r => r.rishi_name === 'Others');
                if (othersRishi) {
                    othersSum += othersRishi.hymn_count;
                }
            }

            const mainItems = originalData.filter(item => {
                if (graphType === 'hymn-count-rishi' && item.rishi_name === 'Others') return false;
                return item[cfg.valueKey] >= cfg.pieThreshold;
            });

            const otherItems = originalData.filter(item => {
                if (graphType === 'hymn-count-rishi' && item.rishi_name === 'Others') return false;
                return item[cfg.valueKey] < cfg.pieThreshold;
            });

            if (otherItems.length > 0) {
                othersSum += otherItems.reduce((sum, item) => sum + item[cfg.valueKey], 0);
            }

            if (othersSum > 0 && otherItems.length > 0) {
                let mainLabels = mainItems.map(item => item[cfg.labelKey]);
                if(cfg.shortenLabels) mainLabels = mainLabels.map(shortenLabel);
                finalLabels = [...mainLabels, 'Others'];

                finalDatasets[0].data = [...mainItems.map(item => item[cfg.valueKey]), othersSum];

                const finalColors = mainItems.map(item => getColor(cfg.colorScheme, item[cfg.labelKey]));
                finalColors.push(getColor(cfg.colorScheme, 'Others'));
                finalDatasets[0].backgroundColor = finalColors;

                let legendMainItems = mainItems.map(item => ({label: item[cfg.labelKey], color: getColor(cfg.colorScheme, item[cfg.labelKey])}));
                if(cfg.shortenLabels) legendMainItems.forEach(item => item.label = shortenLabel(item.label));
                finalLegendData = [...legendMainItems, { label: 'Others', color: getColor(cfg.colorScheme, 'Others') }];
            }
        }
    } else if (chartDisplayType === 'bar' && finalLabels.length > cfg.dataLimit) {
        finalLabels = finalLabels.slice(0, cfg.dataLimit);
        finalDatasets.forEach(dataset => {
            dataset.data = dataset.data.slice(0, cfg.dataLimit);
        });
    }

    const canvas = document.getElementById('insight-chart');
    generateHtmlLegend(finalLegendData);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0 },
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: generateChartTitle(graphType, chartDisplayType),
                font: { size: 18 }, color: CHART_DEFAULTS.fontColor, padding: { bottom: 20 }
            },
            tooltip: {},
            datalabels: chartDisplayType === 'bar' ? { display: false } : {
                formatter: (value, ctx) => {
                    const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                    const percentage = (value / total) * 100;
                    return percentage > 3 ? `${percentage.toFixed(0)}%` : '';
                },
                color: '#fff', font: { weight: 'bold' }
            }
        },
        scales: chartDisplayType === 'bar' ? {
            x: { stacked: cfg.mode === 'stacked', grid: { display: false } },
            y: { stacked: cfg.mode === 'stacked', beginAtZero: true, grid: { color: '#8d7b5c33' }, title: { display: true, text: cfg.yAxisLabel } }
        } : {}
    };

    chartInstance = new Chart(canvas.getContext('2d'), { type: chartDisplayType, data: { labels: finalLabels, datasets: finalDatasets }, options });
}

function renderMultiPieCharts(processedData, cfg) {
    const { primaryCategories, legendData } = processedData;
    const wrapper = document.getElementById('pie-charts-wrapper');
    wrapper.innerHTML = '';
    generateHtmlLegend(legendData);

    primaryCategories.forEach((item, index) => {
        if (!item[cfg.secondaryKey] || item[cfg.secondaryKey].length === 0) return;

        const itemContainer = document.createElement('div');
        itemContainer.className = 'pie-chart-item';
        itemContainer.dataset.primaryKey = item[cfg.primaryKey];
        const canvas = document.createElement('canvas');
        canvas.id = `pie-chart-${index}`;
        itemContainer.appendChild(canvas);
        wrapper.appendChild(itemContainer);

        const chartData = {
            labels: item[cfg.secondaryKey].map(sub => sub[cfg.labelKey]),
            datasets: [{
                data: item[cfg.secondaryKey].map(sub => sub[cfg.valueKey]),
                backgroundColor: item[cfg.secondaryKey].map(sub => getColor(cfg.colorScheme, sub[cfg.labelKey])),
                borderColor: '#FFFFFF',
                borderWidth: 2,
            }]
        };
        const options = {
            responsive: true,
            maintainAspectRatio: true,
            animation: { duration: 0 },
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: cfg.shortenLabels ? shortenLabel(item[cfg.primaryKey]) : `${cfg.primaryLabelPrefix || ''}${item[cfg.primaryKey]}`,
                    font: { size: 18 }, color: CHART_DEFAULTS.fontColor, padding: { bottom: 20 }
                },
                datalabels: {
                    formatter: (value, ctx) => {
                        const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        const percentage = (value / total) * 100;
                        return percentage > 5 ? `${percentage.toFixed(0)}%` : '';
                    },
                    color: '#fff', font: { weight: 'bold', family: CHART_DEFAULTS.fontFamily }
                },
                tooltip: {},
            }
        };
        pieChartInstances.push(new Chart(canvas.getContext('2d'), { type: 'pie', data: chartData, options }));
    });

    setupMultiChartFilter(primaryCategories, cfg);
}

function setupMultiChartFilter(primaryCategories, cfg) {
    const selectContainer = document.getElementById('multi-chart-select-container');
    selectContainer.innerHTML = '';
    selectContainer.classList.add('hidden');
    const multiPieThreshold = 10;

    if (primaryCategories.length > multiPieThreshold) {
        selectContainer.classList.remove('hidden');
        const label = document.createElement('label');
        label.htmlFor = 'multi-chart-filter-select';
        label.textContent = `Filter by ${cfg.filterLabel}:`;

        const select = document.createElement('select');
        select.id = 'multi-chart-filter-select';
        select.innerHTML = `<option value="all">Show All</option>`;
        primaryCategories.forEach(item => {
            const optionLabel = cfg.shortenLabels ? shortenLabel(item[cfg.primaryKey]) : `${cfg.primaryLabelPrefix || ''}${item[cfg.primaryKey]}`;
            select.innerHTML += `<option value="${item[cfg.primaryKey]}">${optionLabel}</option>`;
        });

        select.addEventListener('change', (event) => {
            const selectedValue = event.target.value;
            document.querySelectorAll('#pie-charts-wrapper .pie-chart-item').forEach(item => {
                item.style.display = (selectedValue === 'all' || item.dataset.primaryKey == selectedValue) ? 'flex' : 'none';
            });
        });
        selectContainer.appendChild(label);
        selectContainer.appendChild(select);
    }
}

function generateHtmlLegend(legendItems) {
    const container = document.getElementById('custom-legend-container');
    container.innerHTML = '';
    if (legendItems.length === 0) {
        container.classList.add('hidden');
        return;
    }

    if (legendItems.length > 40) {
        const message = document.createElement('p');
        message.textContent = `Showing legend for top 30 of ${legendItems.length} items.`;
        message.style.gridColumn = '1 / -1';
        container.appendChild(message);
        legendItems = legendItems.slice(0, 30);
    }
    legendItems.forEach(item => {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `<div class="legend-swatch" style="background-color: ${item.color};"></div><span>${item.label}</span>`;
        container.appendChild(legendItem);
    });
    container.classList.remove('hidden');
}

function generateChartTitle(graphType, chartType) {
    const baseTitle = graphType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const typeLabel = chartType.charAt(0).toUpperCase() + chartType.slice(1);
    return `${baseTitle} (${typeLabel} Chart)`;
}