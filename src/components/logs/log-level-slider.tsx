import * as React from 'react';
import Slider from '@mui/joy/Slider';

const marks = [
    {
        value: 0,
        label: 'FATAL',
    },
    {
        value: 1,
        label: 'ERROR',
    },
    {
        value: 2,
        label: 'WARN',
    },
    {
        value: 3,
        label: 'INFO',
    },
    {
        value: 4,
        label: 'DEBUG',
    },
];

function valueText(value: number) {
    return marks[value].label;
}

export default function LogLevelSlider() {
    return (
        <Slider
            aria-label="Log Level"
            color='neutral'
            defaultValue={0}
            getAriaValueText={valueText}
            step={1}
            min={0}
            max={4}
            // valueLabelDisplay="auto"
            marks={marks}
        />
    )
}