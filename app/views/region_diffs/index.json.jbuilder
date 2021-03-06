json.array! @region_diffs do |region_diff|
	json.id region_diff.id
	json.track_diff_id region_diff.track_diff_id
	json.region_id region_diff.region_id
	json.start_time region_diff.start_time

	json.filters do
		json.array! region_diff.filters do |filter|
			json.name filter.name
			json.track_id filter.track_id
			json.settings filter.settings
			json.track_diff_id filter.track_diff_id
			json.signal_path_order filter.signal_path_order
			json.filter_type filter.filter_type
			json.region_id filter.region_id
			json.region_diff_id filter.region_diff_id
			json.id filter.id

			json.filter_automations do
				json.array! filter.filter_automations do |filter_automation|
					json.id filter_automation.id
					json.method_name filter_automation.method_name
					json.args filter_automation.args
					json.filter_id filter_automation.filter_id
				end
			end	
		end
	end
end