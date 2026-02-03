import { Color } from '@theme/color';
import font from '@theme/font';
import { fileLogger } from '@utils/FileLogger';
import { t } from 'i18next';
import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
 

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;  // Add name to identify which boundary caught the error
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    fileLogger.error('[ErrorBoundary] getDerivedStateFromError', {
      message: error.message,
      stack: error.stack
    });
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    const { name = 'Unknown' } = this.props;

    fileLogger.error(`[ErrorBoundary ${name}] componentDidCatch`, {
      errorMessage: error.message,
      errorStack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundaryName: name
    });

    if (__DEV__) {
     }
    // TODO: Log to crash reporting service
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>
               {t("discover.something")}
              </Text>
            <Text style={styles.message}>
              {t("discover.were")}
            </Text>
            {__DEV__ && this.state.error && (
              <Text style={styles.error}>{this.state.error.toString()}</Text>
            )}
            <TouchableOpacity style={styles.button} onPress={this.handleReset}>
              <Text style={styles.buttonText}>{t("discover.tryAgain")}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: font.PoppinsBold,
    color: Color.whiteText,
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    fontFamily: font.PoppinsRegular,
    color: Color.placeHolder,
    textAlign: 'center',
    marginBottom: 20,
  },
  error: {
    fontSize: 12,
    fontFamily: font.PoppinsRegular,
    color:    '#ff6b6b',
    marginBottom: 20,
    padding: 10,
    backgroundColor: 'rgba(255,107,107,0.1)',
    borderRadius: 5,
  },
  button: {
    backgroundColor: Color.primary || '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  buttonText: {
    color: Color.whiteText,
    fontSize: 16,
    fontFamily: font.PoppinsMedium,
  },
});

export default ErrorBoundary;