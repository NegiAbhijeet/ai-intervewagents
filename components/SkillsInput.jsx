// components/SkillsInput.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import debounce from 'lodash.debounce';
import fetchWithAuth from '../libs/fetchWithAuth';
const MAX_SKILLS = 10;

const SkillsInput = ({
  userProfile,
  myCandidate,
  selectedPosition,
  setSelectedPosition,
  skills,
  setSkills,
}) => {
  const [currentSkill, setCurrentSkill] = useState('');
  const [loadingSkills, setLoadingSkills] = useState(false);

  const fetchSkillsForPosition = async position => {
    setLoadingSkills(true);
    try {
      const body = {
        position,
        experience: myCandidate?.experienceYears || 0,
        uid: userProfile?.uid,
      };

      const response = await fetchWithAuth(`${API_URL}/generate-skills/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch skills');
      }

      const data = await response.json();
      const newSkills = data.skills || [];
      const limitedSkills = newSkills.slice(0, MAX_SKILLS);
      setSkills(limitedSkills);
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoadingSkills(false);
    }
  };

  const debouncedFetch = useCallback(
    debounce(value => {
      if (value.trim().length > 0) {
        fetchSkillsForPosition(value.trim());
      }
    }, 500),
    [myCandidate, userProfile],
  );

  const handlePositionChange = value => {
    setSelectedPosition(value);
  };

  const addSkill = () => {
    if (!currentSkill.trim()) return;

    const newSkills = currentSkill
      .split(',')
      .map(s => s.trim())
      .filter(s => s && !skills.includes(s));

    if (skills.length + newSkills.length > MAX_SKILLS) {
      alert(`You can only add up to ${MAX_SKILLS} skills.`);
      return;
    }

    setSkills([...skills, ...newSkills]);
    setCurrentSkill('');
  };

  const removeSkill = skill => {
    setSkills(skills.filter(s => s !== skill));
  };

  return (
    <View>
      {/* Position */}
      <Text style={styles.label}>
        <Icon name="user-check" size={16} color="#10b981" /> Position *
      </Text>
      <TextInput
        value={selectedPosition}
        onChangeText={handlePositionChange}
        placeholder="Type a position..."
        style={styles.input}
      />

      {/* Skills */}
      <Text style={styles.label}>
        <Icon name="code" size={16} color="#10b981" /> Add Skills *
      </Text>
      <View style={styles.row}>
        <TextInput
          value={currentSkill}
          onChangeText={setCurrentSkill}
          placeholder="e.g. JavaScript, React"
          style={[styles.input, { flex: 1 }]}
          onSubmitEditing={addSkill}
        />
        <TouchableOpacity style={styles.addButton} onPress={addSkill}>
          <Text style={{ color: 'white', fontSize: 18 }}>+</Text>
        </TouchableOpacity>
      </View>

      {/* {loadingSkills ? (
        <ActivityIndicator color="#3b82f6" style={{ marginVertical: 10 }} />
      ) : ( */}
      <View style={styles.skillContainer}>
        {skills.map(skill => (
          <View key={skill} style={styles.skillBadge}>
            <Text style={styles.skillText}>{skill}</Text>
            <TouchableOpacity onPress={() => removeSkill(skill)}>
              <Text style={{ color: 'white', marginLeft: 6 }}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      {/* )} */}
    </View>
  );
};

export default SkillsInput;

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#334155',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#334155',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginLeft: 8,
  },
  skillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: 'white',
    fontSize: 13,
  },
});
