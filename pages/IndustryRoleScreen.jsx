import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';

// industries data
const industries = {
  'IT & Software': [
    'Software Engineer / Developer',
    'Full Stack Developer',
    'Data Scientist',
    'Machine Learning Engineer',
    'DevOps Engineer',
    'Cloud Engineer',
    'Cybersecurity Analyst',
    'Product Manager',
  ],
  'Banking, Finance and Insurance': [
    'Financial Analyst',
    'Investment Banker',
    'Risk Analyst',
    'Corporate Finance Analyst',
    'Compliance Officer',
    'Fintech Product Manager',
    'Credit Risk Manager',
    'Portfolio Manager',
  ],
  'Engineering (Mech, Electrical, Civil, Industrial)': [
    'Design Engineer',
    'Project Manager (Engineering)',
    'Mechanical Engineer (Production / Manufacturing)',
    'Civil Site Engineer',
    'Electrical Design Engineer',
    'Process Engineer',
    'Automation Engineer',
    'Quality Control (QC) Engineer',
  ],
  'Data Science and Analytics': [
    'Data Scientist',
    'Machine Learning Engineer',
    'Data Analyst',
    'Data Engineer',
    'Business Intelligence (BI) Analyst',
    'MLOps Engineer',
    'Data Architect',
    'NLP Engineer',
  ],
  'Consulting and Business Strategy': [
    'Management Consultant',
    'Strategy Consultant',
    'Corporate Strategy Analyst',
    'Operations Consultant',
    'Digital Transformation Consultant',
    'Financial Consultant',
    'HR Strategy Consultant',
    'Sustainability / ESG Consultant',
  ],
  'Aviation and Aerospace': [
    'Commercial Pilot',
    'Aircraft Maintenance Engineer (AME)',
    'Aerospace Engineer',
    'Avionics Engineer',
    'Flight Operations Manager',
    'Aviation Safety Officer',
    'Aerospace Project Manager',
    'Air Traffic Controller',
  ],
  'Shipping, Logistics and Supply Chain': [
    'Supply Chain Manager',
    'Logistics Manager',
    'Procurement Specialist / Buyer',
    'Warehouse Manager',
    'Export-Import (EXIM) Executive',
    'Supply Chain Analyst',
    'Global Sourcing Manager',
    'Transportation Planner',
  ],
  'Renewable Energy and Solar': [
    'Solar Design Engineer',
    'Project Manager (Renewable Energy)',
    'O&M Engineer (Operations and Maintenance)',
    'Battery Systems Engineer',
    'Renewable Energy Consultant',
    'Business Development Manager (Renewable Energy)',
    'Energy Policy Analyst',
    'Microgrid Engineer',
  ],
  'Manufacturing and Production': [
    'Production Engineer',
    'Process Engineer',
    'Quality Assurance (QA) Engineer',
    'Maintenance Engineer',
    'Procurement Engineer',
    'R&D Engineer',
    'EHS Officer (Environment, Health, Safety)',
    'Plant Manager',
  ],
  'Healthcare and Pharmaceuticals': [
    'Doctor / Physician',
    'Nurse / Registered Nurse (RN)',
    'Pharmacist',
    'Clinical Research Associate (CRA)',
    'Biomedical Engineer',
    'Hospital Administrator / Manager',
    'Medical Representative (MR)',
    'Public Health Officer',
  ],
};

const Radio = ({ selected }) => (
  <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
    <View style={[styles.radioInner, selected && styles.radioInnerActive]} />
  </View>
);

const IndustryRoleScreen = ({
  navigation,
  nextScreenName = 'NextScreen',
  onComplete,
}) => {
  const [step, setStep] = useState(1); // 1 = pick industry, 2 = pick role
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  const data = useMemo(
    () => Object.keys(industries).map(k => ({ key: k, roles: industries[k] })),
    [],
  );

  const onPressNext = () => {
    if (step === 1) {
      if (!selectedIndustry) return; // guarded by disabled button, but safe check
      setStep(2);
      setSelectedRole(null);
      return;
    }

    // step === 2 -> finish
    if (!selectedRole) return;

    if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate(nextScreenName, {
        industry: selectedIndustry,
        role: selectedRole,
      });
      return;
    }

    if (typeof onComplete === 'function') {
      onComplete(selectedIndustry, selectedRole);
    }
  };

  const onPressBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedRole(null);
    }
  };

  const renderIndustry = ({ item }) => {
    const chosen = selectedIndustry === item.key;
    return (
      <Pressable onPress={() => setSelectedIndustry(item.key)}>
        <View style={[styles.card, chosen && styles.cardSelected]}>
          <View style={{ flex: 1 }}>
            {/* <Text style={styles.label} numberOfLines={1}>
              {item.key}
            </Text> */}
            <View style={styles.row}>
              <Text
                numberOfLines={1}
                style={[styles.value, chosen && styles.cardSelected]}
              >
                {item.key}
              </Text>
            </View>
          </View>
          {/* <View style={styles.rightArrowContainer}>
            <Image
              source={require('../assets/images/rightArrow2.png')}
              style={styles.rightArrow}
              resizeMode="cover"
            />
          </View> */}
          {/* <Radio selected={chosen} /> */}
        </View>
      </Pressable>
    );
  };

  const renderRole = ({ item }) => {
    const chosen = selectedRole === item;
    return (
      <Pressable onPress={() => setSelectedRole(item)}>
        <View style={[styles.roleRow, chosen && styles.cardSelected]}>
          <View style={{ flex: 1 }}>
            {/* <Text style={styles.label} numberOfLines={1}>
              {item.key}
            </Text> */}
            <View style={styles.row}>
              <Text
                numberOfLines={1}
                style={[styles.value, chosen && styles.cardSelected]}
              >
                {item}
              </Text>
            </View>
          </View>
          {/* <Text numberOfLines={1} style={styles.roleText}>
            {item}
          </Text> */}
          {/* <Radio selected={chosen} /> */}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
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
            <Text style={styles.dropdownLabel}>Select Your Industry</Text>
            <FlatList
              data={data}
              renderItem={renderIndustry}
              keyExtractor={i => i.key}
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
              Roles in {selectedIndustry}
            </Text>
            <FlatList
              data={industries[selectedIndustry] || []}
              renderItem={({ item }) => renderRole({ item })}
              keyExtractor={i => i}
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
                <Text style={{ color: '#111827' }}>Back</Text>
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
  rightArrowContainer: { paddingLeft: 16 },

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
    width: '90%',
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
    lineHeight: '170%',
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
