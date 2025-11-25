import {
  View,
  Text,
  Pressable,
  FlatList,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { AppStateContext } from '../components/AppContext'
import BackgroundGradient2 from '../components/backgroundGradient2'
import { useContext, useMemo, useState } from 'react';

const IndustryRoleScreen = () => {
  const navigation = useNavigation()
  const { language } = useContext(AppStateContext)

  const [step, setStep] = useState(1)
  const [selectedIndustry, setSelectedIndustry] = useState(null)
  const [selectedRole, setSelectedRole] = useState(null)
  const [selectedSkills, setSelectedSkills] = useState([])
  const [selectedLevel, setSelectedLevel] = useState(null)

  function getIndustryData(lang) {
    if (lang === 'hi') return require('../libs/industryJson-hi.json')
    if (lang === 'en') return require('../libs/industryJson.json')
    return require('../libs/industryJson.json')
  }

  function getLevelData(lang) {
    if (lang === 'hi') return require('../libs/levels-hi.json')
    if (lang === 'en') return require('../libs/levels.json')
    return require('../libs/levels.json')
  }

  // return value directly from useMemo
  const industries = useMemo(() => getIndustryData(language) || {}, [language])
  const LEVELS = useMemo(() => getLevelData(language) || {}, [language])

  const data = useMemo(() => {
    // ensure industries is an object before mapping
    if (!industries || typeof industries !== 'object') return []
    return Object.keys(industries).map(k => ({ key: k, roles: industries[k] }))
  }, [industries])


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
    <View style={styles.container}>
      <BackgroundGradient2 />
      <View style={styles.screenWrap}>
        {step === 1 && (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Choose Your Domain</Text>
            </View>
            <Text style={styles.dropdownLabel}>
              Select your domain for better matches.
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
              <Text style={styles.title}>Select Your Level</Text>
            </View>
            <Text style={styles.dropdownLabel}>
              Pick your experience level.
            </Text>
            <FlatList
              data={LEVELS || []}
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

          {/* <View style={styles.bottomBlackLine} /> */}
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
    borderRadius: 10.6,
    marginBottom: 6,
    borderWidth: 1,
    paddingHorizontal: 20,
    borderColor: 'rgba(242, 242, 242, 1)',
    shadowColor: '#C70039',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 1,
    paddingVertical: 12
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
  },
  value: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 27.2
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
    lineHeight: 27.2,
  },
  buttonText: { color: 'white', fontSize: 18, fontWeight: '600', lineHeight: 27.2 },
  bottomBlackLine: {
    marginTop: 36,
    height: 5,
    width: 135,
    backgroundColor: 'rgba(17, 17, 17, 1)',
    alignSelf: 'center',
  },
});

export default IndustryRoleScreen;
