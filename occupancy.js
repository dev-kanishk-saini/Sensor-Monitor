

export const occupancy = (m_avg , s_avg,motion_thres,static_thres) => {
            let occupied ;
            let absence = [];
    for( let i=0 ; i<m_avg.length -1 ; i++){
        if(!occupied){
         
      if(m_avg[i] > motion_thres[i]){
        
        return occupied = 1;;
      }}
      else{
        if(m_avg[i] < motion_thres[i] && s_avg[i] <= static_thres[i]){
         absence[i] = 0;
          }else{
          absence[i] = 1;
       }
      }
    
       
    }

    absence.forEach((element) => {
       if(element === 1){
         return occupied = 1;
       }
    })
     return occupied = 0;

}