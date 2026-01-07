<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Branch;
use App\Models\Building;
use App\Models\Floor;
use App\Models\Unit;
use Illuminate\Support\Facades\DB;

class PowerPlantStructureSeeder extends Seeder
{
    /**
     * Seed the power plant structure (branches, buildings, floors, units)
     */
    public function run(): void
    {
        DB::transaction(function () {
            // Clear existing data
            $this->command->info("Clearing existing power plant structure data...");
            Unit::truncate();
            Floor::truncate();
            Building::truncate();
            Branch::truncate();

            // Create Branches
            $this->command->info("Creating branches...");
            $branches = [
                ['id' => 1, 'name' => 'Main Facility', 'location' => 'Calamba, Laguna', 'type' => 'main', 'description' => 'Primary power generation facility'],
                ['id' => 2, 'name' => 'Substation Alpha', 'location' => 'Santa Rosa, Laguna', 'type' => 'substation', 'description' => 'Distribution and transmission substation'],
                ['id' => 3, 'name' => 'Substation Beta', 'location' => 'Biñan, Laguna', 'type' => 'substation', 'description' => 'Secondary distribution substation'],
            ];
            foreach ($branches as $branch) {
                Branch::create($branch);
            }

            // Create Buildings
            $this->command->info("Creating buildings...");
            $buildings = [
                // Main Facility Buildings
                ['id' => 1, 'branch_id' => 1, 'name' => 'Administrative Building', 'type' => 'administrative', 'total_floors' => 3, 'area' => 1500],
                ['id' => 2, 'branch_id' => 1, 'name' => 'Production Hall A', 'type' => 'production', 'total_floors' => 2, 'area' => 3000],
                ['id' => 3, 'branch_id' => 1, 'name' => 'Production Hall B', 'type' => 'production', 'total_floors' => 2, 'area' => 2800],
                ['id' => 4, 'branch_id' => 1, 'name' => 'Maintenance Building', 'type' => 'maintenance', 'total_floors' => 2, 'area' => 1200],
                ['id' => 5, 'branch_id' => 1, 'name' => 'Control Center', 'type' => 'control', 'total_floors' => 1, 'area' => 800],
                ['id' => 6, 'branch_id' => 1, 'name' => 'Warehouse', 'type' => 'storage', 'total_floors' => 1, 'area' => 2000],
                // Substation Alpha Buildings
                ['id' => 7, 'branch_id' => 2, 'name' => 'Control Room', 'type' => 'control', 'total_floors' => 1, 'area' => 400],
                ['id' => 8, 'branch_id' => 2, 'name' => 'Equipment Hall', 'type' => 'production', 'total_floors' => 1, 'area' => 600],
                // Substation Beta Buildings
                ['id' => 9, 'branch_id' => 3, 'name' => 'Control Room', 'type' => 'control', 'total_floors' => 1, 'area' => 350],
                ['id' => 10, 'branch_id' => 3, 'name' => 'Equipment Hall', 'type' => 'production', 'total_floors' => 1, 'area' => 550],
            ];
            foreach ($buildings as $building) {
                Building::create($building);
            }

            // Create Floors
            $this->command->info("Creating floors...");
            $floors = [
                // Administrative Building Floors
                ['id' => 1, 'building_id' => 1, 'floor_number' => 1, 'name' => 'Ground Floor', 'area' => 500, 'unit_count' => 8],
                ['id' => 2, 'building_id' => 1, 'floor_number' => 2, 'name' => 'Second Floor', 'area' => 500, 'unit_count' => 6],
                ['id' => 3, 'building_id' => 1, 'floor_number' => 3, 'name' => 'Third Floor', 'area' => 500, 'unit_count' => 5],
                // Production Hall A Floors
                ['id' => 4, 'building_id' => 2, 'floor_number' => 1, 'name' => 'Turbine Floor', 'area' => 1500, 'unit_count' => 12],
                ['id' => 5, 'building_id' => 2, 'floor_number' => 2, 'name' => 'Control Floor', 'area' => 1500, 'unit_count' => 8],
                // Production Hall B Floors
                ['id' => 6, 'building_id' => 3, 'floor_number' => 1, 'name' => 'Turbine Floor', 'area' => 1400, 'unit_count' => 10],
                ['id' => 7, 'building_id' => 3, 'floor_number' => 2, 'name' => 'Control Floor', 'area' => 1400, 'unit_count' => 7],
                // Maintenance Building Floors
                ['id' => 8, 'building_id' => 4, 'floor_number' => 1, 'name' => 'Workshop', 'area' => 600, 'unit_count' => 6],
                ['id' => 9, 'building_id' => 4, 'floor_number' => 2, 'name' => 'Storage', 'area' => 600, 'unit_count' => 4],
                // Control Center
                ['id' => 10, 'building_id' => 5, 'floor_number' => 1, 'name' => 'Main Control', 'area' => 800, 'unit_count' => 15],
                // Warehouse
                ['id' => 11, 'building_id' => 6, 'floor_number' => 1, 'name' => 'Storage Area', 'area' => 2000, 'unit_count' => 5],
                // Substation Alpha Floors
                ['id' => 12, 'building_id' => 7, 'floor_number' => 1, 'name' => 'Control Room', 'area' => 400, 'unit_count' => 8],
                ['id' => 13, 'building_id' => 8, 'floor_number' => 1, 'name' => 'Equipment Area', 'area' => 600, 'unit_count' => 10],
                // Substation Beta Floors
                ['id' => 14, 'building_id' => 9, 'floor_number' => 1, 'name' => 'Control Room', 'area' => 350, 'unit_count' => 7],
                ['id' => 15, 'building_id' => 10, 'floor_number' => 1, 'name' => 'Equipment Area', 'area' => 550, 'unit_count' => 9],
            ];
            foreach ($floors as $floor) {
                Floor::create($floor);
            }

            // Create Units
            $this->command->info("Creating units...");
            $units = $this->getUnitsData();
            foreach ($units as $unit) {
                Unit::create($unit);
            }

            $this->command->info("Power plant structure seeded successfully!");
            $this->command->info("Branches: " . Branch::count());
            $this->command->info("Buildings: " . Building::count());
            $this->command->info("Floors: " . Floor::count());
            $this->command->info("Units: " . Unit::count());
        });
    }

    /**
     * Get units data matching the frontend structure
     */
    private function getUnitsData(): array
    {
        return [
            // Administrative Building - Floor 1
            ['floor_id' => 1, 'name' => 'Main Office', 'equipment_type' => 'HVAC', 'consumption' => 45.2, 'cost' => 452.00, 'status' => 'operational', 'peak_time' => '2:00 PM'],
            ['floor_id' => 1, 'name' => 'Reception Area', 'equipment_type' => 'Lighting', 'consumption' => 12.5, 'cost' => 125.00, 'status' => 'operational', 'peak_time' => '9:00 AM'],
            ['floor_id' => 1, 'name' => 'Conference Room A', 'equipment_type' => 'HVAC', 'consumption' => 18.3, 'cost' => 183.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            ['floor_id' => 1, 'name' => 'Server Room', 'equipment_type' => 'IT Equipment', 'consumption' => 68.7, 'cost' => 687.00, 'status' => 'operational', 'peak_time' => '12:00 PM'],
            ['floor_id' => 1, 'name' => 'Break Room', 'equipment_type' => 'Appliances', 'consumption' => 8.9, 'cost' => 89.00, 'status' => 'operational', 'peak_time' => '12:00 PM'],
            ['floor_id' => 1, 'name' => 'Storage Room', 'equipment_type' => 'Lighting', 'consumption' => 5.2, 'cost' => 52.00, 'status' => 'operational', 'peak_time' => '8:00 AM'],
            ['floor_id' => 1, 'name' => 'Restroom A', 'equipment_type' => 'Lighting', 'consumption' => 3.1, 'cost' => 31.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            ['floor_id' => 1, 'name' => 'Restroom B', 'equipment_type' => 'Lighting', 'consumption' => 3.1, 'cost' => 31.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            
            // Administrative Building - Floor 2
            ['floor_id' => 2, 'name' => 'Executive Offices', 'equipment_type' => 'HVAC', 'consumption' => 52.4, 'cost' => 524.00, 'status' => 'operational', 'peak_time' => '2:00 PM'],
            ['floor_id' => 2, 'name' => 'Meeting Room B', 'equipment_type' => 'HVAC', 'consumption' => 22.1, 'cost' => 221.00, 'status' => 'operational', 'peak_time' => '11:00 AM'],
            ['floor_id' => 2, 'name' => 'IT Department', 'equipment_type' => 'IT Equipment', 'consumption' => 45.8, 'cost' => 458.00, 'status' => 'operational', 'peak_time' => '1:00 PM'],
            ['floor_id' => 2, 'name' => 'HR Office', 'equipment_type' => 'HVAC', 'consumption' => 15.6, 'cost' => 156.00, 'status' => 'operational', 'peak_time' => '9:00 AM'],
            ['floor_id' => 2, 'name' => 'Finance Office', 'equipment_type' => 'HVAC', 'consumption' => 18.9, 'cost' => 189.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            ['floor_id' => 2, 'name' => 'Restroom C', 'equipment_type' => 'Lighting', 'consumption' => 3.1, 'cost' => 31.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            
            // Administrative Building - Floor 3
            ['floor_id' => 3, 'name' => 'Board Room', 'equipment_type' => 'HVAC', 'consumption' => 28.5, 'cost' => 285.00, 'status' => 'operational', 'peak_time' => '3:00 PM'],
            ['floor_id' => 3, 'name' => 'Executive Suite', 'equipment_type' => 'HVAC', 'consumption' => 35.2, 'cost' => 352.00, 'status' => 'operational', 'peak_time' => '2:00 PM'],
            ['floor_id' => 3, 'name' => 'Archive Room', 'equipment_type' => 'Lighting', 'consumption' => 6.8, 'cost' => 68.00, 'status' => 'operational', 'peak_time' => '9:00 AM'],
            ['floor_id' => 3, 'name' => 'Pantry', 'equipment_type' => 'Appliances', 'consumption' => 12.3, 'cost' => 123.00, 'status' => 'operational', 'peak_time' => '12:00 PM'],
            ['floor_id' => 3, 'name' => 'Restroom D', 'equipment_type' => 'Lighting', 'consumption' => 3.1, 'cost' => 31.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            
            // Production Hall A - Floor 1 (Turbine Floor)
            ['floor_id' => 4, 'name' => 'Turbine Unit 1', 'equipment_type' => 'Turbine', 'consumption' => 285.4, 'cost' => 2854.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            ['floor_id' => 4, 'name' => 'Turbine Unit 2', 'equipment_type' => 'Turbine', 'consumption' => 292.1, 'cost' => 2921.00, 'status' => 'operational', 'peak_time' => '11:00 AM'],
            ['floor_id' => 4, 'name' => 'Turbine Unit 3', 'equipment_type' => 'Turbine', 'consumption' => 278.9, 'cost' => 2789.00, 'status' => 'operational', 'peak_time' => '10:30 AM'],
            ['floor_id' => 4, 'name' => 'Cooling System A', 'equipment_type' => 'Cooling', 'consumption' => 45.6, 'cost' => 456.00, 'status' => 'operational', 'peak_time' => '12:00 PM'],
            ['floor_id' => 4, 'name' => 'Cooling System B', 'equipment_type' => 'Cooling', 'consumption' => 42.3, 'cost' => 423.00, 'status' => 'operational', 'peak_time' => '12:00 PM'],
            ['floor_id' => 4, 'name' => 'Ventilation System', 'equipment_type' => 'HVAC', 'consumption' => 38.7, 'cost' => 387.00, 'status' => 'operational', 'peak_time' => '1:00 PM'],
            ['floor_id' => 4, 'name' => 'Lighting System', 'equipment_type' => 'Lighting', 'consumption' => 25.4, 'cost' => 254.00, 'status' => 'operational', 'peak_time' => '8:00 AM'],
            ['floor_id' => 4, 'name' => 'Safety Systems', 'equipment_type' => 'Safety', 'consumption' => 12.8, 'cost' => 128.00, 'status' => 'operational', 'peak_time' => '9:00 AM'],
            ['floor_id' => 4, 'name' => 'Monitoring Equipment', 'equipment_type' => 'Monitoring', 'consumption' => 8.5, 'cost' => 85.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            ['floor_id' => 4, 'name' => 'Auxiliary Systems', 'equipment_type' => 'Auxiliary', 'consumption' => 35.2, 'cost' => 352.00, 'status' => 'operational', 'peak_time' => '11:00 AM'],
            ['floor_id' => 4, 'name' => 'Emergency Systems', 'equipment_type' => 'Emergency', 'consumption' => 5.6, 'cost' => 56.00, 'status' => 'operational', 'peak_time' => '9:00 AM'],
            ['floor_id' => 4, 'name' => 'Workshop Area', 'equipment_type' => 'Tools', 'consumption' => 18.9, 'cost' => 189.00, 'status' => 'operational', 'peak_time' => '2:00 PM'],
            
            // Production Hall A - Floor 2 (Control Floor)
            ['floor_id' => 5, 'name' => 'Main Control Room', 'equipment_type' => 'Control Systems', 'consumption' => 68.4, 'cost' => 684.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            ['floor_id' => 5, 'name' => 'SCADA System', 'equipment_type' => 'IT Equipment', 'consumption' => 45.2, 'cost' => 452.00, 'status' => 'operational', 'peak_time' => '11:00 AM'],
            ['floor_id' => 5, 'name' => 'Monitoring Station A', 'equipment_type' => 'Monitoring', 'consumption' => 12.5, 'cost' => 125.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            ['floor_id' => 5, 'name' => 'Monitoring Station B', 'equipment_type' => 'Monitoring', 'consumption' => 12.5, 'cost' => 125.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            ['floor_id' => 5, 'name' => 'HVAC Control', 'equipment_type' => 'HVAC', 'consumption' => 28.7, 'cost' => 287.00, 'status' => 'operational', 'peak_time' => '2:00 PM'],
            ['floor_id' => 5, 'name' => 'Lighting Control', 'equipment_type' => 'Lighting', 'consumption' => 15.3, 'cost' => 153.00, 'status' => 'operational', 'peak_time' => '8:00 AM'],
            ['floor_id' => 5, 'name' => 'Communication Hub', 'equipment_type' => 'IT Equipment', 'consumption' => 18.9, 'cost' => 189.00, 'status' => 'operational', 'peak_time' => '9:00 AM'],
            ['floor_id' => 5, 'name' => 'Backup Systems', 'equipment_type' => 'Backup', 'consumption' => 22.1, 'cost' => 221.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            
            // Production Hall B - Floor 1
            ['floor_id' => 6, 'name' => 'Turbine Unit 4', 'equipment_type' => 'Turbine', 'consumption' => 275.8, 'cost' => 2758.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            ['floor_id' => 6, 'name' => 'Turbine Unit 5', 'equipment_type' => 'Turbine', 'consumption' => 268.4, 'cost' => 2684.00, 'status' => 'operational', 'peak_time' => '10:30 AM'],
            ['floor_id' => 6, 'name' => 'Cooling System C', 'equipment_type' => 'Cooling', 'consumption' => 41.2, 'cost' => 412.00, 'status' => 'operational', 'peak_time' => '12:00 PM'],
            ['floor_id' => 6, 'name' => 'Cooling System D', 'equipment_type' => 'Cooling', 'consumption' => 39.8, 'cost' => 398.00, 'status' => 'operational', 'peak_time' => '12:00 PM'],
            ['floor_id' => 6, 'name' => 'Ventilation System', 'equipment_type' => 'HVAC', 'consumption' => 35.6, 'cost' => 356.00, 'status' => 'operational', 'peak_time' => '1:00 PM'],
            ['floor_id' => 6, 'name' => 'Lighting System', 'equipment_type' => 'Lighting', 'consumption' => 23.1, 'cost' => 231.00, 'status' => 'operational', 'peak_time' => '8:00 AM'],
            ['floor_id' => 6, 'name' => 'Safety Systems', 'equipment_type' => 'Safety', 'consumption' => 11.5, 'cost' => 115.00, 'status' => 'operational', 'peak_time' => '9:00 AM'],
            ['floor_id' => 6, 'name' => 'Monitoring Equipment', 'equipment_type' => 'Monitoring', 'consumption' => 7.8, 'cost' => 78.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            ['floor_id' => 6, 'name' => 'Auxiliary Systems', 'equipment_type' => 'Auxiliary', 'consumption' => 32.4, 'cost' => 324.00, 'status' => 'operational', 'peak_time' => '11:00 AM'],
            ['floor_id' => 6, 'name' => 'Emergency Systems', 'equipment_type' => 'Emergency', 'consumption' => 5.2, 'cost' => 52.00, 'status' => 'operational', 'peak_time' => '9:00 AM'],
            
            // Production Hall B - Floor 2
            ['floor_id' => 7, 'name' => 'Control Room B', 'equipment_type' => 'Control Systems', 'consumption' => 62.3, 'cost' => 623.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            ['floor_id' => 7, 'name' => 'SCADA System B', 'equipment_type' => 'IT Equipment', 'consumption' => 42.8, 'cost' => 428.00, 'status' => 'operational', 'peak_time' => '11:00 AM'],
            ['floor_id' => 7, 'name' => 'Monitoring Station C', 'equipment_type' => 'Monitoring', 'consumption' => 11.2, 'cost' => 112.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            ['floor_id' => 7, 'name' => 'Monitoring Station D', 'equipment_type' => 'Monitoring', 'consumption' => 11.2, 'cost' => 112.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            ['floor_id' => 7, 'name' => 'HVAC Control', 'equipment_type' => 'HVAC', 'consumption' => 26.5, 'cost' => 265.00, 'status' => 'operational', 'peak_time' => '2:00 PM'],
            ['floor_id' => 7, 'name' => 'Lighting Control', 'equipment_type' => 'Lighting', 'consumption' => 14.1, 'cost' => 141.00, 'status' => 'operational', 'peak_time' => '8:00 AM'],
            ['floor_id' => 7, 'name' => 'Communication Hub', 'equipment_type' => 'IT Equipment', 'consumption' => 17.3, 'cost' => 173.00, 'status' => 'operational', 'peak_time' => '9:00 AM'],
            
            // Maintenance Building - Floor 1
            ['floor_id' => 8, 'name' => 'Workshop A', 'equipment_type' => 'Tools', 'consumption' => 35.2, 'cost' => 352.00, 'status' => 'operational', 'peak_time' => '2:00 PM'],
            ['floor_id' => 8, 'name' => 'Workshop B', 'equipment_type' => 'Tools', 'consumption' => 32.8, 'cost' => 328.00, 'status' => 'operational', 'peak_time' => '2:00 PM'],
            ['floor_id' => 8, 'name' => 'Tool Storage', 'equipment_type' => 'Lighting', 'consumption' => 8.5, 'cost' => 85.00, 'status' => 'operational', 'peak_time' => '8:00 AM'],
            ['floor_id' => 8, 'name' => 'Equipment Testing', 'equipment_type' => 'Testing', 'consumption' => 28.7, 'cost' => 287.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            ['floor_id' => 8, 'name' => 'HVAC System', 'equipment_type' => 'HVAC', 'consumption' => 22.3, 'cost' => 223.00, 'status' => 'operational', 'peak_time' => '1:00 PM'],
            ['floor_id' => 8, 'name' => 'Lighting System', 'equipment_type' => 'Lighting', 'consumption' => 18.9, 'cost' => 189.00, 'status' => 'operational', 'peak_time' => '8:00 AM'],
            
            // Maintenance Building - Floor 2
            ['floor_id' => 9, 'name' => 'Parts Storage A', 'equipment_type' => 'Lighting', 'consumption' => 12.4, 'cost' => 124.00, 'status' => 'operational', 'peak_time' => '9:00 AM'],
            ['floor_id' => 9, 'name' => 'Parts Storage B', 'equipment_type' => 'Lighting', 'consumption' => 11.8, 'cost' => 118.00, 'status' => 'operational', 'peak_time' => '9:00 AM'],
            ['floor_id' => 9, 'name' => 'Archive Storage', 'equipment_type' => 'Lighting', 'consumption' => 6.2, 'cost' => 62.00, 'status' => 'operational', 'peak_time' => '8:00 AM'],
            ['floor_id' => 9, 'name' => 'Office Space', 'equipment_type' => 'HVAC', 'consumption' => 15.6, 'cost' => 156.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            
            // Control Center
            ['floor_id' => 10, 'name' => 'Main Control Panel', 'equipment_type' => 'Control Systems', 'consumption' => 125.4, 'cost' => 1254.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            ['floor_id' => 10, 'name' => 'SCADA Master', 'equipment_type' => 'IT Equipment', 'consumption' => 85.2, 'cost' => 852.00, 'status' => 'operational', 'peak_time' => '11:00 AM'],
            ['floor_id' => 10, 'name' => 'Monitoring Center A', 'equipment_type' => 'Monitoring', 'consumption' => 28.7, 'cost' => 287.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            ['floor_id' => 10, 'name' => 'Monitoring Center B', 'equipment_type' => 'Monitoring', 'consumption' => 28.7, 'cost' => 287.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            ['floor_id' => 10, 'name' => 'Monitoring Center C', 'equipment_type' => 'Monitoring', 'consumption' => 28.7, 'cost' => 287.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            ['floor_id' => 10, 'name' => 'Communication Center', 'equipment_type' => 'IT Equipment', 'consumption' => 45.8, 'cost' => 458.00, 'status' => 'operational', 'peak_time' => '9:00 AM'],
            ['floor_id' => 10, 'name' => 'Backup Systems', 'equipment_type' => 'Backup', 'consumption' => 35.2, 'cost' => 352.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            ['floor_id' => 10, 'name' => 'Emergency Response', 'equipment_type' => 'Emergency', 'consumption' => 22.1, 'cost' => 221.00, 'status' => 'operational', 'peak_time' => '9:00 AM'],
            ['floor_id' => 10, 'name' => 'HVAC System', 'equipment_type' => 'HVAC', 'consumption' => 42.3, 'cost' => 423.00, 'status' => 'operational', 'peak_time' => '2:00 PM'],
            ['floor_id' => 10, 'name' => 'Lighting System', 'equipment_type' => 'Lighting', 'consumption' => 25.6, 'cost' => 256.00, 'status' => 'operational', 'peak_time' => '8:00 AM'],
            ['floor_id' => 10, 'name' => 'Security Systems', 'equipment_type' => 'Security', 'consumption' => 18.9, 'cost' => 189.00, 'status' => 'operational', 'peak_time' => '9:00 AM'],
            ['floor_id' => 10, 'name' => 'Data Center', 'equipment_type' => 'IT Equipment', 'consumption' => 68.4, 'cost' => 684.00, 'status' => 'operational', 'peak_time' => '12:00 PM'],
            ['floor_id' => 10, 'name' => 'Conference Room', 'equipment_type' => 'HVAC', 'consumption' => 22.5, 'cost' => 225.00, 'status' => 'operational', 'peak_time' => '2:00 PM'],
            ['floor_id' => 10, 'name' => 'Break Room', 'equipment_type' => 'Appliances', 'consumption' => 15.2, 'cost' => 152.00, 'status' => 'operational', 'peak_time' => '12:00 PM'],
            ['floor_id' => 10, 'name' => 'Restroom', 'equipment_type' => 'Lighting', 'consumption' => 4.2, 'cost' => 42.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            
            // Warehouse
            ['floor_id' => 11, 'name' => 'Storage Area A', 'equipment_type' => 'Lighting', 'consumption' => 28.5, 'cost' => 285.00, 'status' => 'operational', 'peak_time' => '8:00 AM'],
            ['floor_id' => 11, 'name' => 'Storage Area B', 'equipment_type' => 'Lighting', 'consumption' => 26.8, 'cost' => 268.00, 'status' => 'operational', 'peak_time' => '8:00 AM'],
            ['floor_id' => 11, 'name' => 'Loading Dock', 'equipment_type' => 'Lighting', 'consumption' => 18.9, 'cost' => 189.00, 'status' => 'operational', 'peak_time' => '9:00 AM'],
            ['floor_id' => 11, 'name' => 'Ventilation System', 'equipment_type' => 'HVAC', 'consumption' => 35.2, 'cost' => 352.00, 'status' => 'operational', 'peak_time' => '1:00 PM'],
            ['floor_id' => 11, 'name' => 'Security Office', 'equipment_type' => 'Security', 'consumption' => 12.4, 'cost' => 124.00, 'status' => 'operational', 'peak_time' => '9:00 AM'],
            
            // Substation Alpha - Control Room
            ['floor_id' => 12, 'name' => 'Control Panel', 'equipment_type' => 'Control Systems', 'consumption' => 45.2, 'cost' => 452.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            ['floor_id' => 12, 'name' => 'Monitoring Station', 'equipment_type' => 'Monitoring', 'consumption' => 18.5, 'cost' => 185.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            ['floor_id' => 12, 'name' => 'SCADA System', 'equipment_type' => 'IT Equipment', 'consumption' => 28.7, 'cost' => 287.00, 'status' => 'operational', 'peak_time' => '11:00 AM'],
            ['floor_id' => 12, 'name' => 'Communication Hub', 'equipment_type' => 'IT Equipment', 'consumption' => 12.3, 'cost' => 123.00, 'status' => 'operational', 'peak_time' => '9:00 AM'],
            ['floor_id' => 12, 'name' => 'HVAC System', 'equipment_type' => 'HVAC', 'consumption' => 22.1, 'cost' => 221.00, 'status' => 'operational', 'peak_time' => '2:00 PM'],
            ['floor_id' => 12, 'name' => 'Lighting System', 'equipment_type' => 'Lighting', 'consumption' => 15.6, 'cost' => 156.00, 'status' => 'operational', 'peak_time' => '8:00 AM'],
            ['floor_id' => 12, 'name' => 'Backup Systems', 'equipment_type' => 'Backup', 'consumption' => 18.9, 'cost' => 189.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            ['floor_id' => 12, 'name' => 'Emergency Systems', 'equipment_type' => 'Emergency', 'consumption' => 8.5, 'cost' => 85.00, 'status' => 'operational', 'peak_time' => '9:00 AM'],
            
            // Substation Alpha - Equipment Hall
            ['floor_id' => 13, 'name' => 'Transformer Unit 1', 'equipment_type' => 'Transformer', 'consumption' => 125.4, 'cost' => 1254.00, 'status' => 'operational', 'peak_time' => '11:00 AM'],
            ['floor_id' => 13, 'name' => 'Transformer Unit 2', 'equipment_type' => 'Transformer', 'consumption' => 118.7, 'cost' => 1187.00, 'status' => 'operational', 'peak_time' => '11:00 AM'],
            ['floor_id' => 13, 'name' => 'Switchgear', 'equipment_type' => 'Switchgear', 'consumption' => 45.2, 'cost' => 452.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            ['floor_id' => 13, 'name' => 'Cooling System', 'equipment_type' => 'Cooling', 'consumption' => 28.5, 'cost' => 285.00, 'status' => 'operational', 'peak_time' => '12:00 PM'],
            ['floor_id' => 13, 'name' => 'Ventilation', 'equipment_type' => 'HVAC', 'consumption' => 18.9, 'cost' => 189.00, 'status' => 'operational', 'peak_time' => '1:00 PM'],
            ['floor_id' => 13, 'name' => 'Lighting System', 'equipment_type' => 'Lighting', 'consumption' => 12.3, 'cost' => 123.00, 'status' => 'operational', 'peak_time' => '8:00 AM'],
            ['floor_id' => 13, 'name' => 'Safety Systems', 'equipment_type' => 'Safety', 'consumption' => 8.5, 'cost' => 85.00, 'status' => 'operational', 'peak_time' => '9:00 AM'],
            ['floor_id' => 13, 'name' => 'Monitoring Equipment', 'equipment_type' => 'Monitoring', 'consumption' => 6.2, 'cost' => 62.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            ['floor_id' => 13, 'name' => 'Auxiliary Systems', 'equipment_type' => 'Auxiliary', 'consumption' => 15.8, 'cost' => 158.00, 'status' => 'operational', 'peak_time' => '11:00 AM'],
            ['floor_id' => 13, 'name' => 'Emergency Systems', 'equipment_type' => 'Emergency', 'consumption' => 5.1, 'cost' => 51.00, 'status' => 'operational', 'peak_time' => '9:00 AM'],
            
            // Substation Beta - Control Room
            ['floor_id' => 14, 'name' => 'Control Panel', 'equipment_type' => 'Control Systems', 'consumption' => 42.8, 'cost' => 428.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            ['floor_id' => 14, 'name' => 'Monitoring Station', 'equipment_type' => 'Monitoring', 'consumption' => 17.2, 'cost' => 172.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            ['floor_id' => 14, 'name' => 'SCADA System', 'equipment_type' => 'IT Equipment', 'consumption' => 26.5, 'cost' => 265.00, 'status' => 'operational', 'peak_time' => '11:00 AM'],
            ['floor_id' => 14, 'name' => 'Communication Hub', 'equipment_type' => 'IT Equipment', 'consumption' => 11.5, 'cost' => 115.00, 'status' => 'operational', 'peak_time' => '9:00 AM'],
            ['floor_id' => 14, 'name' => 'HVAC System', 'equipment_type' => 'HVAC', 'consumption' => 20.3, 'cost' => 203.00, 'status' => 'operational', 'peak_time' => '2:00 PM'],
            ['floor_id' => 14, 'name' => 'Lighting System', 'equipment_type' => 'Lighting', 'consumption' => 14.2, 'cost' => 142.00, 'status' => 'operational', 'peak_time' => '8:00 AM'],
            ['floor_id' => 14, 'name' => 'Backup Systems', 'equipment_type' => 'Backup', 'consumption' => 17.1, 'cost' => 171.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            
            // Substation Beta - Equipment Hall
            ['floor_id' => 15, 'name' => 'Transformer Unit 1', 'equipment_type' => 'Transformer', 'consumption' => 118.4, 'cost' => 1184.00, 'status' => 'operational', 'peak_time' => '11:00 AM'],
            ['floor_id' => 15, 'name' => 'Transformer Unit 2', 'equipment_type' => 'Transformer', 'consumption' => 112.3, 'cost' => 1123.00, 'status' => 'operational', 'peak_time' => '11:00 AM'],
            ['floor_id' => 15, 'name' => 'Switchgear', 'equipment_type' => 'Switchgear', 'consumption' => 42.1, 'cost' => 421.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            ['floor_id' => 15, 'name' => 'Cooling System', 'equipment_type' => 'Cooling', 'consumption' => 26.8, 'cost' => 268.00, 'status' => 'operational', 'peak_time' => '12:00 PM'],
            ['floor_id' => 15, 'name' => 'Ventilation', 'equipment_type' => 'HVAC', 'consumption' => 17.5, 'cost' => 175.00, 'status' => 'operational', 'peak_time' => '1:00 PM'],
            ['floor_id' => 15, 'name' => 'Lighting System', 'equipment_type' => 'Lighting', 'consumption' => 11.2, 'cost' => 112.00, 'status' => 'operational', 'peak_time' => '8:00 AM'],
            ['floor_id' => 15, 'name' => 'Safety Systems', 'equipment_type' => 'Safety', 'consumption' => 7.8, 'cost' => 78.00, 'status' => 'operational', 'peak_time' => '9:00 AM'],
            ['floor_id' => 15, 'name' => 'Monitoring Equipment', 'equipment_type' => 'Monitoring', 'consumption' => 5.8, 'cost' => 58.00, 'status' => 'operational', 'peak_time' => '10:00 AM'],
            ['floor_id' => 15, 'name' => 'Auxiliary Systems', 'equipment_type' => 'Auxiliary', 'consumption' => 14.6, 'cost' => 146.00, 'status' => 'operational', 'peak_time' => '11:00 AM'],
        ];
        return $units;
    }
}

