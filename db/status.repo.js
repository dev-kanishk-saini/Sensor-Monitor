import { supabase } from './supabase.js';

/**
 * Insert presence/absence state
 */
export async function insertStatus(state) {
  const { error } = await supabase
    .from('Status')
    .insert([
      {
        state,
        //created_at: new Date()
      }
    ]);

  if (error) {
    console.error('❌ Failed to insert status:', error);
    return false;
  }

  return true;
}



export async function insertRealtimeData(payload) {

  const dbRow = {
    mode: payload.Mode,
    targetstatus: payload.TargetStatus,
    movingtargetdistance: payload.MovingTargetDistance,
    movingtargetsignalstrength: payload.MovingTargetSignalStrength,
    statictargetdistance: payload.StaticTargetDistance,
    statictargetsignalstrength: payload.StaticTargetSignalStrength,
    detectiondistance: payload.DetectionDistance,
    maximummotiondistancedoor: payload.MaximumMotionDistanceDoor,
    maximumstaticdistancedoor: payload.MaximumStaticDistanceDoor,
    motiongatevalues: payload.MotionGateValues,
    staticgatevalues: payload.StaticGateValues,
    maxmotionvalues: payload.maxmotionvalues,
    maxstaticvalues: payload.maxstaticvalues,
    photosensitivevalue: payload.PhotoSensitiveValue,
    output: payload.Output
  };

  const { error } = await supabase
    .from('realtime_data')
    .insert([dbRow]);

  if (error) {
    console.error('❌ Failed to insert realtime data:', error);
    return false;
  }

 // console.log("✅ Realtime data inserted");
  return true;
}

export async function getLatestRealtimeData() {
  console.log("Fetching latest realtime data from database...");
  const { data, error } = await supabase
  .rpc('get_realtime_data_by_second', {
    input_timestamp: '2026-02-24 19:19:49'
  });

if (error) {
  console.error(error);
} else {
  console.log(data);
  return data;
}
}