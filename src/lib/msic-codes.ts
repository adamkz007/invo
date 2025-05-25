export interface MSICCode {
  code: string;
  description: string;
  category?: string;
}

export const msicCodes: MSICCode[] = [
  { code: '00000', description: 'NOT APPLICABLE' },
  { 
    category: 'AGRICULTURE, FORESTRY AND FISHING',
    code: '01111', 
    description: 'Growing of maize' 
  },
  { 
    code: '01112', 
    description: 'Growing of leguminous crops' 
  },
  { 
    code: '01113', 
    description: 'Growing of oil seeds' 
  },
  { 
    code: '01119', 
    description: 'Growing of other cereals n.e.c.' 
  },
  { 
    code: '01120', 
    description: 'Growing of paddy' 
  },
  { 
    code: '01131', 
    description: 'Growing of leafy or stem vegetables' 
  },
  { 
    code: '01132', 
    description: 'Growing of fruits bearing vegetables' 
  },
  { 
    code: '01133', 
    description: 'Growing of melons' 
  },
  { 
    code: '01134', 
    description: 'Growing of mushrooms and truffles' 
  },
  { 
    code: '01135', 
    description: 'Growing of vegetables seeds, except beet seeds' 
  },
  { 
    code: '01136', 
    description: 'Growing of other vegetables' 
  },
  { 
    code: '01137', 
    description: 'Growing of sugar beet' 
  },
  { 
    code: '01138', 
    description: 'Growing of roots, tubers, bulb or tuberous vegetables' 
  },
  { 
    code: '01140', 
    description: 'Growing of sugar cane' 
  },
  { 
    code: '01150', 
    description: 'Growing of tobacco' 
  },
  { 
    code: '01160', 
    description: 'Growing of fibre crops' 
  },
  { 
    code: '01191', 
    description: 'Growing of flowers' 
  },
  { 
    code: '01192', 
    description: 'Growing of flower seeds' 
  },
  { 
    code: '01193', 
    description: 'Growing of sago (rumbia)' 
  },
  { 
    code: '01199', 
    description: 'Growing of other non-perennial crops n.e.c.' 
  },
  { 
    code: '01210', 
    description: 'Growing of grapes' 
  },
  { 
    code: '01221', 
    description: 'Growing of banana' 
  },
  { 
    code: '01222', 
    description: 'Growing of mango' 
  },
  { 
    code: '01223', 
    description: 'Growing of durian' 
  },
  { 
    code: '01224', 
    description: 'Growing of rambutan' 
  },
  { 
    code: '01225', 
    description: 'Growing of star fruit' 
  },
  { 
    code: '01226', 
    description: 'Growing of papaya' 
  },
  { 
    code: '01227', 
    description: 'Growing of pineapple' 
  },
  { 
    code: '01228', 
    description: 'Growing of pitaya (dragon fruit)' 
  },
  { 
    code: '01229', 
    description: 'Growing of other tropical and subtropical fruits n.e.c.' 
  },
  { 
    code: '01231', 
    description: 'Growing of pomelo' 
  },
  { 
    code: '01232', 
    description: 'Growing of lemon and limes' 
  },
  { 
    code: '01233', 
    description: 'Growing of tangerines and mandarin' 
  },
  { 
    code: '01239', 
    description: 'Growing of other citrus fruits n.e.c.' 
  },
  { 
    code: '01241', 
    description: 'Growing of guava' 
  },
  { 
    code: '01249', 
    description: 'Growing of other pome fruits and stones fruits n.e.c.' 
  },
  { 
    code: '01251', 
    description: 'Growing of berries' 
  },
  { 
    code: '01252', 
    description: 'Growing of fruit seeds' 
  },
  { 
    code: '01253', 
    description: 'Growing of edible nuts' 
  },
  { 
    code: '01259', 
    description: 'Growing of other tree and bush fruits' 
  },
  { 
    code: '01261', 
    description: 'Growing of oil palm (estate)' 
  },
  { 
    code: '01262', 
    description: 'Growing of oil palm (smallholdings)' 
  },
  { 
    code: '01263', 
    description: 'Growing of coconut (estate and smallholdings)' 
  },
  { 
    code: '01269', 
    description: 'Growing of other oleaginous fruits n.e.c.' 
  },
  { 
    code: '01271', 
    description: 'Growing of coffee' 
  },
  { 
    code: '01272', 
    description: 'Growing of tea' 
  },
  { 
    code: '01273', 
    description: 'Growing of cocoa' 
  },
  { 
    code: '01279', 
    description: 'Growing of other beverage crops n.e.c.' 
  },
  { 
    code: '01281', 
    description: 'Growing of pepper (piper nigrum)' 
  },
  { 
    code: '01282', 
    description: 'Growing of chilies and pepper (capsicum spp.)' 
  },
  { 
    code: '01283', 
    description: 'Growing of nutmeg' 
  },
  // Adding more codes from the website
  {
    category: 'REPAIR OF COMPUTERS AND PERSONAL AND HOUSEHOLD GOODS',
    code: '95111',
    description: 'Repair of electronic equipment'
  },
  {
    code: '95112',
    description: 'Repair and maintenance of computer terminals'
  },
  {
    code: '95113',
    description: 'Repair and maintenance of hand-held computers (PDA\'s)'
  },
  {
    code: '95121',
    description: 'Repair and maintenance of cordless telephones'
  },
  {
    code: '95122',
    description: 'Repair and maintenance of cellular phones'
  },
  {
    code: '95123',
    description: 'Repair and maintenance of carrier equipment modems'
  },
  {
    code: '95124',
    description: 'Repair and maintenance of fax machines'
  },
  {
    code: '95125',
    description: 'Repair and maintenance of communications transmission equipment'
  },
  {
    code: '95126',
    description: 'Repair and maintenance of two-way radios'
  },
  {
    code: '95127',
    description: 'Repair and maintenance of commercial TV and video cameras'
  },
  {
    category: 'OTHER PERSONAL SERVICE ACTIVITIES',
    code: '96011',
    description: 'Laundering and dry-cleaning, pressing'
  },
  {
    code: '96012',
    description: 'Carpet and rug shampooing, and drapery and curtain cleaning'
  },
  {
    code: '96013',
    description: 'Provision of linens, work uniforms and related items by laundries'
  },
  {
    code: '96014',
    description: 'Diaper supply services'
  },
  {
    code: '96020',
    description: 'Hairdressing and other beauty treatment'
  },
  {
    code: '96031',
    description: 'Preparing the dead for burial or cremation and embalming and morticians\' services'
  },
  {
    code: '96032',
    description: 'Providing burial or cremation services'
  },
  {
    code: '96033',
    description: 'Rental of equipped space in funeral parlours'
  },
  {
    code: '96034',
    description: 'Rental or sale of graves'
  },
  {
    code: '96035',
    description: 'Maintenance of graves and mausoleums'
  },
  {
    code: '96091',
    description: 'Activities of sauna, steam baths, massage salons'
  },
  {
    code: '96092',
    description: 'Astrological and spiritualists\' activities'
  },
  {
    code: '96093',
    description: 'Social activities such as escort services, dating services, services of marriage bureaux'
  },
  {
    code: '96094',
    description: 'Pet care services'
  },
  {
    code: '96095',
    description: 'Genealogical organizations'
  },
  {
    code: '96096',
    description: 'Shoe shiners, porters, valet car parkers'
  },
  {
    code: '96097',
    description: 'Concession operation of coin-operated personal service machines'
  },
  {
    code: '96099',
    description: 'Other service activities n.e.c.'
  },
  {
    category: 'ACTIVITIES OF HOUSEHOLDS AS EMPLOYERS',
    code: '97000',
    description: 'Activities of households as employers of domestic personnel'
  },
  {
    code: '98100',
    description: 'Undifferentiated goods-producing activities of private households for own use'
  },
  {
    code: '98200',
    description: 'Undifferentiated service-producing activities of private households for own use'
  },
  {
    category: 'ACTIVITIES OF EXTRATERRITORIAL ORGANIZATIONS AND BODIES',
    code: '99000',
    description: 'Activities of extraterritorial organization and bodies'
  }
]; 