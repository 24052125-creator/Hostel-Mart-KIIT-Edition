export const HOSTELS = [
    ...Array.from({ length: 25 }, (_, i) => `KP-${i + 1}`),
    ...Array.from({ length: 25 }, (_, i) => `QC-${i + 1}`),
];

export const FLOORS = [
    ...Array.from({ length: 10 }, (_, i) => {
        const n = i + 1;
        let suffix = "th";
        if (n === 1) suffix = "st";
        else if (n === 2) suffix = "nd";
        else if (n === 3) suffix = "rd";
        return `${n}${suffix} Floor`;
    }),
];
