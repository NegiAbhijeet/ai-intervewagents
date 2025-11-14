import { useNavigation } from '@react-navigation/native';
import React, { useState, useMemo, useContext } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { AppStateContext } from '../components/AppContext';

// industries data
const industries = {
  "IT & Software": {
    "Software Engineer / Developer": [
      "Java",
      "Python",
      "Data Structures & Algorithms",
      "Git",
      "SQL"
    ],
    "Full Stack Developer": [
      "React",
      "Node.js",
      "MongoDB",
      "Express.js",
      "JavaScript"
    ],
    "Data Scientist": [
      "Python",
      "Machine Learning",
      "Pandas",
      "Tableau",
      "SQL"
    ],
    "Machine Learning Engineer": [
      "Python",
      "TensorFlow",
      "PyTorch",
      "Kubernetes",
      "Docker"
    ],
    "DevOps Engineer": [
      "Docker",
      "Kubernetes",
      "Jenkins",
      "Terraform",
      "AWS"
    ],
    "Cloud Engineer": [
      "AWS",
      "Azure",
      "Terraform",
      "Kubernetes",
      "Python"
    ],
    "Cybersecurity Analyst": [
      "Network Security",
      "Penetration Testing",
      "SIEM",
      "Python",
      "Wireshark"
    ],
    "Product Manager": [
      "JIRA",
      "SQL",
      "Figma",
      "Google Analytics",
      "Excel"
    ]
  },
  "Banking, Finance and Insurance": {
    "Financial Analyst": [
      "Excel",
      "Financial Modeling",
      "SQL",
      "Bloomberg Terminal",
      "PowerPoint"
    ],
    "Investment Banker": [
      "Excel",
      "PowerPoint",
      "Financial Modeling",
      "Bloomberg Terminal",
      "Capital IQ"
    ],
    "Risk Analyst": [
      "Python",
      "R",
      "SQL",
      "Excel",
      "SAS"
    ],
    "Corporate Finance Analyst": [
      "Excel",
      "SAP",
      "Oracle",
      "PowerPoint",
      "SQL"
    ],
    "Compliance Officer": [
      "AML/KYC",
      "Risk Assessment",
      "Regulatory Knowledge",
      "Audit Tools",
      "MS Office"
    ],
    "Fintech Product Manager": [
      "SQL",
      "JIRA",
      "API Integration",
      "Figma",
      "Google Analytics"
    ],
    "Credit Risk Manager": [
      "Python",
      "SAS",
      "Excel",
      "SQL",
      "R"
    ],
    "Portfolio Manager": [
      "Bloomberg Terminal",
      "Excel",
      "Financial Modeling",
      "Python",
      "Risk Management Tools"
    ]
  },
  "Engineering (Mech, Electrical, Civil, Industrial)": {
    "Design Engineer": [
      "AutoCAD",
      "SolidWorks",
      "CATIA",
      "ANSYS",
      "Creo"
    ],
    "Project Manager (Engineering)": [
      "MS Project",
      "Primavera P6",
      "AutoCAD",
      "Excel",
      "SAP"
    ],
    "Mechanical Engineer (Production / Manufacturing)": [
      "AutoCAD",
      "SolidWorks",
      "Lean Manufacturing",
      "SAP",
      "CNC Programming"
    ],
    "Civil Site Engineer": [
      "AutoCAD",
      "Civil 3D",
      "Primavera",
      "MS Project",
      "Total Station"
    ],
    "Electrical Design Engineer": [
      "AutoCAD Electrical",
      "ETAP",
      "MATLAB",
      "PLC Programming",
      "EPLAN"
    ],
    "Process Engineer": [
      "Aspen HYSYS",
      "Aspen Plus",
      "Six Sigma",
      "AutoCAD",
      "MATLAB"
    ],
    "Automation Engineer": [
      "PLC Programming",
      "SCADA",
      "Siemens TIA Portal",
      "Allen Bradley",
      "HMI"
    ],
    "Quality Control (QC) Engineer": [
      "ISO 9001",
      "Statistical Process Control",
      "Minitab",
      "Six Sigma",
      "CMM"
    ]
  },
  "Data Science and Analytics": {
    "Data Scientist": [
      "Python",
      "Machine Learning",
      "Pandas",
      "SQL",
      "Scikit-learn"
    ],
    "Machine Learning Engineer": [
      "Python",
      "TensorFlow",
      "PyTorch",
      "Docker",
      "Kubernetes"
    ],
    "Data Analyst": [
      "SQL",
      "Excel",
      "Tableau",
      "Power BI",
      "Python"
    ],
    "Data Engineer": [
      "SQL",
      "Python",
      "Apache Spark",
      "Airflow",
      "AWS"
    ],
    "Business Intelligence (BI) Analyst": [
      "Tableau",
      "Power BI",
      "SQL",
      "Excel",
      "DAX"
    ],
    "MLOps Engineer": [
      "Docker",
      "Kubernetes",
      "MLflow",
      "Python",
      "Jenkins"
    ],
    "Data Architect": [
      "SQL",
      "MongoDB",
      "Snowflake",
      "AWS Redshift",
      "ETL Tools"
    ],
    "NLP Engineer": [
      "Python",
      "NLTK",
      "spaCy",
      "Transformers",
      "PyTorch"
    ]
  },
  "Consulting and Business Strategy": {
    "Management Consultant": [
      "PowerPoint",
      "Excel",
      "Tableau",
      "SQL",
      "Market Research Tools"
    ],
    "Strategy Consultant": [
      "Excel",
      "PowerPoint",
      "Financial Modeling",
      "Tableau",
      "SQL"
    ],
    "Corporate Strategy Analyst": [
      "Excel",
      "PowerPoint",
      "SQL",
      "Tableau",
      "Financial Modeling"
    ],
    "Operations Consultant": [
      "Lean Six Sigma",
      "Excel",
      "Process Mapping Tools",
      "SQL",
      "Tableau"
    ],
    "Digital Transformation Consultant": [
      "Cloud Platforms (AWS, Azure)",
      "Agile Tools (JIRA)",
      "PowerPoint",
      "Tableau",
      "SQL"
    ],
    "Financial Consultant": [
      "Excel",
      "Financial Planning Software",
      "QuickBooks",
      "SAP",
      "PowerPoint"
    ],
    "HR Strategy Consultant": [
      "HRIS Systems",
      "Excel",
      "PowerPoint",
      "Tableau",
      "Survey Tools"
    ],
    "Sustainability / ESG Consultant": [
      "ESG Reporting Tools",
      "Excel",
      "Tableau",
      "PowerPoint",
      "Carbon Accounting Software"
    ]
  },
  "Aviation and Aerospace": {
    "Commercial Pilot": [
      "CPL License",
      "ATPL License",
      "Flight Simulators",
      "Navigation Systems",
      "Aviation Regulations"
    ],
    "Aircraft Maintenance Engineer (AME)": [
      "Aircraft Systems",
      "AME License",
      "Troubleshooting Tools",
      "DGCA Regulations",
      "Maintenance Software"
    ],
    "Aerospace Engineer": [
      "CATIA",
      "SolidWorks",
      "ANSYS",
      "MATLAB",
      "Simulink"
    ],
    "Avionics Engineer": [
      "Embedded Systems",
      "Circuit Design",
      "MATLAB",
      "DO-178C",
      "Testing Tools"
    ],
    "Flight Operations Manager": [
      "Flight Planning Software",
      "Safety Management Systems",
      "DGCA Regulations",
      "Excel",
      "Resource Management Tools"
    ],
    "Aviation Safety Officer": [
      "Safety Management Systems (SMS)",
      "DGCA Regulations",
      "Risk Assessment Tools",
      "Audit Software",
      "Incident Reporting Systems"
    ],
    "Aerospace Project Manager": [
      "MS Project",
      "Primavera",
      "CATIA",
      "Risk Management Tools",
      "Excel"
    ],
    "Air Traffic Controller": [
      "Radar Systems",
      "Communication Systems",
      "Air Traffic Control Procedures",
      "Flight Planning Software",
      "Navigation Tools"
    ]
  },
  "Shipping, Logistics and Supply Chain": {
    "Supply Chain Manager": [
      "SAP",
      "Oracle SCM",
      "Excel",
      "Demand Planning Software",
      "ERP Systems"
    ],
    "Logistics Manager": [
      "Transportation Management Systems (TMS)",
      "Warehouse Management Systems (WMS)",
      "Excel",
      "SAP",
      "Route Optimization Software"
    ],
    "Procurement Specialist / Buyer": [
      "SAP",
      "Oracle Procurement",
      "Excel",
      "Negotiation Tools",
      "ERP Systems"
    ],
    "Warehouse Manager": [
      "Warehouse Management Systems (WMS)",
      "SAP",
      "Excel",
      "Inventory Management Software",
      "Barcode Scanners"
    ],
    "Export-Import (EXIM) Executive": [
      "Customs Software",
      "Incoterms",
      "Excel",
      "Documentation Tools",
      "Shipping Software"
    ],
    "Supply Chain Analyst": [
      "Excel",
      "Tableau",
      "SQL",
      "SAP",
      "Power BI"
    ],
    "Global Sourcing Manager": [
      "SAP",
      "Oracle",
      "Excel",
      "Supplier Management Tools",
      "ERP Systems"
    ],
    "Transportation Planner": [
      "Transportation Management Systems (TMS)",
      "Route Optimization Software",
      "Excel",
      "GIS Software",
      "SAP"
    ]
  },
  "Renewable Energy and Solar": {
    "Solar Design Engineer": [
      "PVsyst",
      "AutoCAD",
      "Helioscope",
      "SketchUp",
      "MATLAB"
    ],
    "Project Manager (Renewable Energy)": [
      "MS Project",
      "Primavera P6",
      "AutoCAD",
      "Excel",
      "SAP"
    ],
    "O&M Engineer (Operations and Maintenance)": [
      "SCADA Systems",
      "PVsyst",
      "Monitoring Software",
      "Troubleshooting Tools",
      "Safety Equipment"
    ],
    "Battery Systems Engineer": [
      "MATLAB",
      "Simulink",
      "Battery Management Systems (BMS)",
      "Power Electronics Design",
      "Testing Equipment"
    ],
    "Renewable Energy Consultant": [
      "PVsyst",
      "HOMER",
      "Excel",
      "Financial Modeling",
      "RETScreen"
    ],
    "Business Development Manager (Renewable Energy)": [
      "CRM Software",
      "Excel",
      "PowerPoint",
      "Market Research Tools",
      "PVsyst"
    ],
    "Energy Policy Analyst": [
      "Excel",
      "Statistical Software",
      "Policy Research Tools",
      "Tableau",
      "PowerPoint"
    ],
    "Microgrid Engineer": [
      "HOMER",
      "MATLAB",
      "Simulink",
      "ETAP",
      "Power System Design Software"
    ]
  },
  "Manufacturing and Production": {
    "Production Engineer": [
      "AutoCAD",
      "Lean Manufacturing",
      "SAP",
      "Six Sigma",
      "CNC Programming"
    ],
    "Process Engineer": [
      "Aspen HYSYS",
      "Six Sigma",
      "AutoCAD",
      "MATLAB",
      "Process Simulation Software"
    ],
    "Quality Assurance (QA) Engineer": [
      "ISO 9001",
      "Minitab",
      "Six Sigma",
      "Statistical Process Control",
      "Quality Management Software"
    ],
    "Maintenance Engineer": [
      "CMMS Software",
      "AutoCAD",
      "Troubleshooting Tools",
      "SAP",
      "Vibration Analysis Tools"
    ],
    "Procurement Engineer": [
      "SAP",
      "Oracle",
      "Excel",
      "ERP Systems",
      "Vendor Management Software"
    ],
    "R&D Engineer": [
      "CAD Software",
      "SolidWorks",
      "ANSYS",
      "MATLAB",
      "Prototyping Tools"
    ],
    "EHS Officer (Environment, Health, Safety)": [
      "Safety Management Software",
      "Risk Assessment Tools",
      "ISO 45001",
      "Incident Management Systems",
      "Audit Tools"
    ],
    "Plant Manager": [
      "SAP",
      "Lean Six Sigma",
      "Excel",
      "ERP Systems",
      "Production Planning Software"
    ]
  },
  "Healthcare and Pharmaceuticals": {
    "Doctor / Physician": [
      "EMR/EHR Systems",
      "Medical Diagnosis",
      "Clinical Procedures",
      "HIPAA Compliance",
      "Medical Imaging Software"
    ],
    "Nurse / Registered Nurse (RN)": [
      "EMR/EHR Systems",
      "IV Administration",
      "Patient Monitoring Systems",
      "Medication Management",
      "Clinical Procedures"
    ],
    "Pharmacist": [
      "Pharmacy Management Systems",
      "Drug Database Software",
      "Prescription Processing",
      "Inventory Management",
      "Clinical Knowledge"
    ],
    "Clinical Research Associate (CRA)": [
      "GCP Guidelines",
      "Clinical Trial Management Systems",
      "EDC Systems",
      "Regulatory Documentation",
      "Site Monitoring"
    ],
    "Biomedical Engineer": [
      "CAD Software",
      "MATLAB",
      "Medical Device Design",
      "FDA Regulations",
      "Testing Equipment"
    ],
    "Hospital Administrator / Manager": [
      "Hospital Information Systems",
      "Excel",
      "SAP",
      "Healthcare Compliance",
      "Budget Management Software"
    ],
    "Medical Representative (MR)": [
      "CRM Software",
      "PowerPoint",
      "Product Knowledge",
      "Excel",
      "Territory Management Tools"
    ],
    "Public Health Officer": [
      "Epidemiological Software",
      "Statistical Analysis Tools",
      "Excel",
      "SPSS",
      "Health Surveillance Systems"
    ]
  }
}


const levels = [
  { label: 'Entry level (0-2 years)', value: 1 },
  { label: 'Mid-level (2-5 years)', value: 3 },
  { label: 'Senior (5-8 years)', value: 6 },
  { label: 'Executive (8-10+ years)', value: 10 }
];

const IndustryRoleScreen = () => {
  const navigation = useNavigation();
  const {userProfile}=useContext(AppStateContext)
  console.log(userProfile, "==")
  const [step, setStep] = useState(1);
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);

  const data = useMemo(
    () => Object.keys(industries).map(k => ({ key: k, roles: industries[k] })),
    [],
  );

  const onPressNext = () => {
    if (step === 1) {
      if (!selectedIndustry) return; // guarded by disabled button, but safe check
      setStep(2);
      return;
    }

    if (selectedIndustry && selectedRole && step === 2) {
      setStep(3);

      return;
    }
    if (selectedIndustry && selectedRole && selectedLevel && step === 3) {
      console.log('===', selectedIndustry, selectedRole, selectedSkills);

      navigation.navigate('AvatarSelection', {
        selectedIndustry: selectedIndustry,
        selectedRole: selectedRole,
        selectedLevel: selectedLevel,
        selectedSkills: selectedSkills
      });
      return;
    }

    // if (navigation && typeof navigation.navigate === 'function') {
    //   navigation.navigate(nextScreenName, {
    //     industry: selectedIndustry,
    //     role: selectedRole,
    //   });
    //   return;
    // }

    // if (typeof onComplete === 'function') {
    //   onComplete(selectedIndustry, selectedRole);
    // }
  };
  const rolesArray =
    selectedIndustry &&
      industries &&
      industries[selectedIndustry]
      ? Object.keys(industries[selectedIndustry]).map(roleName => ({
        key: roleName,
        skills: industries[selectedIndustry][roleName]
      }))
      : [];


  const renderIndustry = ({ item }) => {
    const chosen = selectedIndustry === item.key;
    return (
      <Pressable onPress={() => setSelectedIndustry(item.key)}>
        <View style={[styles.card, chosen && styles.cardSelected]}>
          <View style={{ flex: 1 }}>
            <View style={styles.row}>
              <Text
                numberOfLines={1}
                style={[styles.value, chosen && styles.cardSelected]}
              >
                {item.key}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderRole = ({ item }) => {
    const chosen = selectedRole === item.key;
    return (
      <Pressable onPress={() => { setSelectedRole(item.key); setSelectedSkills(item?.skills || []) }}>
        <View style={[styles.roleRow, chosen && styles.cardSelected]}>
          <View style={{ flex: 1 }}>
            <View style={styles.row}>
              <Text numberOfLines={1} style={[styles.value, chosen && styles.cardSelected]}>
                {item.key}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderLevel = ({ item }) => {
    const chosen = selectedLevel === item.value;
    return (
      <Pressable onPress={() => setSelectedLevel(item.value)}>
        <View style={[styles.roleRow, chosen && styles.cardSelected]}>
          <View style={{ flex: 1 }}>
            <View style={styles.row}>
              <Text
                numberOfLines={1}
                style={[styles.value, chosen && styles.cardSelected]}
              >
                {item?.label}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}><Image
      source={require('../assets/images/bgGradient.png')}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        transform: 'translateY(250%)',
        height: '100%',
      }}
      resizeMode="cover"
    />
      <Image
        source={require('../assets/images/bgGradient.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <View style={styles.screenWrap}>
        {step === 1 && (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Choose Your Industry</Text>
            </View>
            <Text style={styles.dropdownLabel}>
              Select your industry for better matches.
            </Text>
            <FlatList
              data={data}
              renderItem={renderIndustry}
              keyExtractor={(_, index) => index.toString()}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}

        {step === 2 && (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Choose Your Role</Text>
            </View>
            <Text style={styles.dropdownLabel}>
              Pick a role for personalized practice.
            </Text>
            <FlatList
              data={rolesArray || []}
              renderItem={({ item }) => renderRole({ item })}
              keyExtractor={(_, index) => index.toString()}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
        {step === 3 && (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Select your level</Text>
            </View>
            <Text style={styles.dropdownLabel}>
              Pick your experience level.
            </Text>
            <FlatList
              data={levels || []}
              renderItem={({ item }) => renderLevel({ item })}
              keyExtractor={(_, index) => index.toString()}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}

        <View style={{ height: 30 }} />

        <View style={styles.bottom}>
          {/* <View style={{ marginBottom: 12 }}>
            {step === 2 && (
              <Pressable
                onPress={onPressBack}
                style={{ alignSelf: 'flex-start' }}
              >
                <Text style={{ color: '#1118827' }}>Back</Text>
              </Pressable>
            )}
          </View> */}

          <Pressable
            onPress={onPressNext}
            disabled={!(step === 1 ? selectedIndustry : selectedRole)}
            style={[
              styles.button,
              !(step === 1 ? selectedIndustry : selectedRole) &&
              styles.disabledButton,
            ]}
          >
            <Text style={styles.buttonText}>Next</Text>
          </Pressable>

          <View style={styles.bottomBlackLine} />
        </View>

        <View style={{ height: 40 }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 45,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    width: '100%',
  },
  screenWrap: {
    flex: 1,
    width: '85%',
    marginHorizontal: 'auto',
    justifyContent: 'flex-start',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 14,
    marginBottom: 6,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderColor: 'rgba(242, 242, 242, 1)',
    shadowColor: '#C70039',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 1,
  },
  cardSelected: {
    borderColor: '#111827',
    backgroundColor: 'rgba(0, 0, 0, 1)',
    color: 'white',
  },
  disabledButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 6,
  },
  value: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  dropdownLabel: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 26,
  },
  roleRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'rgba(242, 242, 242, 1)',
    shadowColor: '#C70039',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 1,
  },
  roleRowSelected: {
    borderColor: '#111827',
  },
  roleText: { flex: 1, fontSize: 13.5, color: '#111827', marginRight: 12 },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  radioOuterActive: { borderColor: '#111827' },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  radioInnerActive: { backgroundColor: '#111827' },

  bottom: { width: '90%', alignSelf: 'center' },
  button: {
    backgroundColor: 'rgba(0, 0, 0, 1)',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 30,
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  bottomBlackLine: {
    marginTop: 36,
    height: 5,
    width: 135,
    backgroundColor: 'rgba(17, 17, 17, 1)',
    alignSelf: 'center',
  },
});

export default IndustryRoleScreen;
