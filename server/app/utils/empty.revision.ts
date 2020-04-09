export const EMPTY_REVISION: any = JSON.stringify({
    biomarkers: [
        {type: 'Lesions',
         biomarkers: [
             { type: 'Others', color: '#fff4ee', },
             { type: 'Pigmented lesions', color: '#5bffb7' },
             {type: 'Bright',
              biomarkers: [
                  { type: 'Cotton Wool Spots', color: '#7a9d32' },
                  { type: 'Drusen', color: '#3cb371' },
                  { type: 'Exudates', color: '#85ffa6' },
                  { type: 'Uncertain - Bright', color: '#a9ff84' }
              ]},
             {type: 'Red',
              biomarkers: [
                  { type: 'Hemorrhages', color: '#4b18ff' },
                  { type: 'Microaneurysms', color: '#2a63fd' },
                  { type: 'Sub-retinal hemorrhage', color: '#7a2afd' },
                  { type: 'Pre-retinal hemorrhage', color: '#a12afd' },
                  { type: 'Neovascularization', color: '#ba2afd' },
                  { type: 'Uncertain - Red', color: '#d62afd' }
              ]}
         ]
        },
        {type: 'Normal',
         biomarkers: [
             { type: 'Macula', color: '#be3c1b' },
             {type: 'Optic Nerve',
              biomarkers: [
                  { type: 'Disk', color: '#ddc81c' },
                  { type: 'Cup', color: '#dda61c' }
              ]},
             {type: 'Vasculature',
              biomarkers: [
                  { type: 'Arteries', color: '#dd1c1c' },
                  { type: 'Veins', color: '#6d13b2' },
                  { type: 'Vessels', color: '#770067' }
              ]},
         ],
        }
    ]
})